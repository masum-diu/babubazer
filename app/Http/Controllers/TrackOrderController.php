<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Order tracking is for signed-in customers only (their own orders). Guests only ever
 * see the short thank-you page right after ordering.
 */
class TrackOrderController extends Controller
{
    public function show(Request $request, string $number): Response|RedirectResponse
    {
        $order = Order::query()->with('items')->where('order_number', $number)->first();
        $user = $request->user();

        // Same answer for "no such order" and "not yours".
        if (! $order || ! ($user->is_admin || $order->user_id === $user->id)) {
            return redirect()->route('account.orders')
                ->with('error', 'We could not find that order in your account.');
        }

        return Inertia::render('orders/track', [
            'order' => [
                'order_number' => $order->order_number,
                'status' => $order->status,
                'created_at' => $order->created_at?->toIso8601String(),
                'updated_at' => $order->updated_at?->toIso8601String(),
                'first_name' => explode(' ', trim($order->customer_name))[0] ?? '',
                'division' => $order->division,
                'city' => $order->city,
                'payment_method' => $order->payment_method,
                'subtotal' => $order->subtotal,
                'shipping_fee' => $order->shipping_fee,
                'total' => $order->total,
                'items' => $order->items->map(fn ($item) => [
                    'id' => $item->id,
                    'product_name' => $item->product_name,
                    'color_name' => $item->color_name,
                    'size_name' => $item->size_name,
                    'quantity' => $item->quantity,
                    'line_total' => $item->line_total,
                ])->values(),
            ],
        ]);
    }
}
