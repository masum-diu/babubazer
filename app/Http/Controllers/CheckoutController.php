<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Services\CartService;
use App\Support\BangladeshDivisions;
use App\Support\ShippingFee;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
            'payment_method' => ['required', Rule::in(['cod', 'bkash', 'nagad'])],
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

                if ($cartItem?->product_variant_id) {
                    \App\Models\ProductVariant::whereKey($cartItem->product_variant_id)
                        ->decrement('stock', $line['quantity']);
                    $product = \App\Models\Product::find($line['product']['id']);
                    $product?->syncStockFromVariants();
                } else {
                    \App\Models\Product::whereKey($line['product']['id'])
                        ->decrement('stock', $line['quantity']);
                }
            }

            $this->cart->clear($request);

            return $order;
        });

        $request->session()->put('placed_order_id', $order->id);

        return redirect()->route('orders.show', $order)->with('success', 'Order placed successfully');
    }

    public function show(Request $request, Order $order): Response
    {
        $user = $request->user();
        $allowed = ($user && ($user->is_admin || $order->user_id === $user->id))
            || $request->session()->get('placed_order_id') === $order->id;

        abort_unless($allowed, 403);

        $order->load('items');

        return Inertia::render('orders/show', [
            'order' => $order,
        ]);
    }
}
