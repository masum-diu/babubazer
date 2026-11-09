<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
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

        $order->update($data);

        return back()->with('success', 'Order status updated');
    }
}
