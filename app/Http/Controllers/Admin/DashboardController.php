<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('admin/dashboard', [
            'stats' => [
                'products' => Product::count(),
                'orders' => Order::count(),
                'pending_orders' => Order::where('status', 'pending')->count(),
                'customers' => User::where('is_admin', false)->count(),
                'revenue' => (float) Order::whereIn('status', ['confirmed', 'shipped', 'delivered'])->sum('total'),
            ],
            'recentOrders' => Order::query()->latest()->take(8)->get(),
        ]);
    }
}
