<?php

namespace App\Http\Controllers;

use App\Mail\NewOrderMail;
use App\Models\Order;
use App\Models\OrderItem;
use App\Services\CartService;
use App\Services\StockService;
use App\Support\BangladeshDivisions;
use App\Support\ShippingFee;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    public function __construct(private CartService $cart) {}

    public function create(Request $request): Response|RedirectResponse
    {
        $summary = $this->cart->summary($request);

        if ($summary['count'] === 0) {
            return redirect()->route('cart.index')->with('error', 'Your cart is empty');
        }

        return Inertia::render('checkout/index', [
            'cart' => $summary,
            'user' => $request->user(),
            'divisionTree' => BangladeshDivisions::tree(),
            'shippingRates' => ShippingFee::rates(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $summary = $this->cart->summary($request);

        if ($summary['count'] === 0) {
            return redirect()->route('cart.index')->with('error', 'Your cart is empty');
        }

        $data = $request->validate([
            'customer_name' => ['required', 'string', 'max:120'],
            'customer_email' => ['required', 'email', 'max:255'],
            'customer_phone' => ['required', 'string', 'max:20'],
            'shipping_address' => ['required', 'string', 'max:500'],
            'division' => ['required', 'string', Rule::in(BangladeshDivisions::all())],
            'city' => [
                'required',
                'string',
                'max:100',
                function (string $attribute, mixed $value, \Closure $fail) use ($request) {
                    $division = (string) $request->input('division');
                    if (! BangladeshDivisions::isValidDistrict($division, (string) $value)) {
                        $fail('Please select a valid district for the chosen division.');
                    }
                },
            ],
            'payment_method' => ['required', Rule::in(['cod'])],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $order = DB::transaction(function () use ($request, $data, $summary) {
            $cartItems = $this->cart->items($request)->keyBy('id');

            foreach ($summary['items'] as $line) {
                $cartItem = $cartItems->get($line['id']);
                $product = \App\Models\Product::lockForUpdate()->find($line['product']['id']);
                abort_if(! $product, 422, 'Product missing');

                if ($cartItem?->product_variant_id) {
                    $variant = \App\Models\ProductVariant::lockForUpdate()
                        ->find($cartItem->product_variant_id);
                    abort_if(! $variant || $variant->stock < $line['quantity'], 422, 'Not enough stock');
                } else {
                    abort_if($product->stock < $line['quantity'], 422, 'Not enough stock');
                }
            }

            $shippingFee = ShippingFee::forDivision($data['division'] ?? null);
            $subtotal = (float) $summary['subtotal'];

            $order = Order::create([
                ...$data,
                'order_number' => 'BB-'.now()->format('ymd').'-'.strtoupper(substr(uniqid(), -5)),
                'user_id' => $request->user()?->id,
                'status' => 'pending',
                'subtotal' => $subtotal,
                'shipping_fee' => $shippingFee,
                'total' => $subtotal + $shippingFee,
            ]);

            foreach ($summary['items'] as $line) {
                $cartItem = $cartItems->get($line['id']);
                $variantNameBits = array_filter([
                    $line['color']['name'] ?? null,
                    $line['size']['name'] ?? null,
                ]);
                $displayName = $line['product']['name'];
                if ($variantNameBits) {
                    $displayName .= ' ('.implode(' / ', $variantNameBits).')';
                }

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $line['product']['id'],
                    'product_variant_id' => $cartItem?->product_variant_id,
                    'product_name' => $displayName,
                    'color_name' => $line['color']['name'] ?? null,
                    'size_name' => $line['size']['name'] ?? null,
                    'unit_price' => $line['product']['price'],
                    'quantity' => $line['quantity'],
                    'line_total' => $line['line_total'],
                ]);

                $stockProduct = \App\Models\Product::find($line['product']['id']);
                $stockVariant = $cartItem?->product_variant_id
                    ? \App\Models\ProductVariant::find($cartItem->product_variant_id)
                    : null;
                StockService::adjust(
                    $stockProduct,
                    $stockVariant,
                    -(int) $line['quantity'],
                    'order',
                    'Order '.$order->order_number,
                    $order,
                );
            }

            $this->cart->clear($request);

            return $order;
        });

        $request->session()->put('placed_order_id', $order->id);

        $this->notifyShopOwner($order);

        return redirect()->route('orders.confirmed', $order);
    }

    /**
     * Email the shop owner about a new order. Sent after the response so the customer is
     * never kept waiting, and a mail problem can never undo or break the order itself.
     */
    private function notifyShopOwner(Order $order): void
    {
        $recipients = array_values(array_filter(array_map(
            'trim',
            explode(',', (string) config('shop.order_notification_email')),
        )));

        if ($recipients === []) {
            return;
        }

        app()->terminating(function () use ($order, $recipients) {
            try {
                Mail::to($recipients)->send(new NewOrderMail($order->fresh('items')));
            } catch (\Throwable $e) {
                report($e);
            }
        });
    }

    private function canView(Request $request, Order $order): bool
    {
        $user = $request->user();

        return ($user && ($user->is_admin || $order->user_id === $user->id))
            || $request->session()->get('placed_order_id') === $order->id;
    }

    /** The short "thank you" page shown right after an order is placed. */
    public function confirmed(Request $request, Order $order): Response
    {
        abort_unless($this->canView($request, $order), 403);

        return Inertia::render('orders/confirmed', [
            'orderNumber' => $order->order_number,
            'firstName' => explode(' ', trim($order->customer_name))[0] ?? '',
        ]);
    }

    /** Old order-details link: the tracking page now shows everything (signed-in owner only). */
    public function show(Request $request, Order $order): RedirectResponse
    {
        $user = $request->user();

        abort_unless($user && ($user->is_admin || $order->user_id === $user->id), 403);

        return redirect()->route('track.show', $order->order_number);
    }
}
