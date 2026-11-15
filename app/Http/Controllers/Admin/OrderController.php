<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\StockService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->string('status')->toString();

        $query = Order::query()->latest();

        if (in_array($status, ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'], true)) {
            $query->where('status', $status);
        }

        return Inertia::render('admin/orders/index', [
            'filters' => [
                'status' => $status ?: 'all',
            ],
            'stats' => [
                'all' => Order::count(),
                'pending' => Order::where('status', 'pending')->count(),
                'confirmed' => Order::where('status', 'confirmed')->count(),
                'shipped' => Order::where('status', 'shipped')->count(),
                'delivered' => Order::where('status', 'delivered')->count(),
                'cancelled' => Order::where('status', 'cancelled')->count(),
                'revenue' => (float) Order::whereIn('status', ['confirmed', 'shipped', 'delivered'])->sum('total'),
            ],
            'orders' => $query
                ->withCount('items')
                ->paginate(20)
                ->withQueryString(),
        ]);
    }

    public function show(Order $order): Response
    {
        $order->load('items');

        return Inertia::render('admin/orders/show', [
            'order' => $order,
        ]);
    }

    public function update(Request $request, Order $order): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'])],
        ]);

        $wasCancelled = $order->status === 'cancelled';
        $willCancel = $data['status'] === 'cancelled';
        $order->load('items');

        if ($wasCancelled && ! $willCancel && ! StockService::orderHasEnoughStock($order)) {
            return back()->with('error', 'Not enough stock to re-open this order.');
        }

        $order->update($data);

        if (! $wasCancelled && $willCancel) {
            StockService::restoreOrder($order, $request->user()?->id);
        } elseif ($wasCancelled && ! $willCancel) {
            StockService::deductOrder($order, $request->user()?->id);
        }

        return back()->with('success', 'Order status updated');
    }
}
