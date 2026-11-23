<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\StockService;
use App\Support\BusinessTime;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class OrderController extends Controller
{
    private const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

    /** Orders matching the search box, status and date filters. */
    private function filteredQuery(Request $request)
    {
        $query = Order::query()->latest();

        $status = $request->string('status')->toString();
        if (in_array($status, self::STATUSES, true)) {
            $query->where('status', $status);
        }

        if ($search = $request->string('q')->trim()->toString()) {
            $like = '%'.str_replace(['%', '_'], ['\%', '\_'], $search).'%';
            $query->where(function ($q) use ($like) {
                $q->where('order_number', 'like', $like)
                    ->orWhere('customer_name', 'like', $like)
                    ->orWhere('customer_email', 'like', $like)
                    ->orWhere('customer_phone', 'like', $like);
            });
        }

        if ($from = $request->string('from')->toString()) {
            $query->where('created_at', '>=', BusinessTime::dayStart($from));
        }

        if ($to = $request->string('to')->toString()) {
            $query->where('created_at', '<=', BusinessTime::dayEnd($to));
        }

        return $query;
    }

    public function index(Request $request): Response
    {
        $status = $request->string('status')->toString();

        return Inertia::render('admin/orders/index', [
            'filters' => [
                'status' => in_array($status, self::STATUSES, true) ? $status : 'all',
                'q' => $request->string('q')->trim()->toString(),
                'from' => $request->string('from')->toString(),
                'to' => $request->string('to')->toString(),
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
            'orders' => $this->filteredQuery($request)
                ->withCount('items')
                ->paginate(15)
                ->withQueryString(),
        ]);
    }

    /** CSV of the filtered orders, or of the ticked rows when ids are given. */
    public function export(Request $request): StreamedResponse
    {
        $ids = collect(explode(',', $request->string('ids')->toString()))
            ->map(fn ($id) => (int) $id)
            ->filter()
            ->values();

        $query = $this->filteredQuery($request)->withCount('items');

        if ($ids->isNotEmpty()) {
            $query->whereIn('id', $ids);
        }

        $filename = 'orders-'.now()->format('Y-m-d-His').'.csv';

        return response()->streamDownload(function () use ($query) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF"); // UTF-8 BOM so Excel reads Bangla names correctly
            fputcsv($out, [
                'Order', 'Date', 'Customer', 'Email', 'Phone', 'Division', 'City', 'Address',
                'Payment', 'Status', 'Items', 'Subtotal', 'Delivery', 'Total',
            ]);

            $query->chunk(200, function ($orders) use ($out) {
                foreach ($orders as $order) {
                    fputcsv($out, [
                        $order->order_number,
                        $order->created_at?->copy()->setTimezone(BusinessTime::timezone())->format('Y-m-d H:i'),
                        $order->customer_name,
                        $order->customer_email,
                        $order->customer_phone,
                        $order->division,
                        $order->city,
                        $order->shipping_address,
                        strtoupper((string) $order->payment_method),
                        $order->status,
                        $order->items_count,
                        $order->subtotal,
                        $order->shipping_fee,
                        $order->total,
                    ]);
                }
            });

            fclose($out);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8']);
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
