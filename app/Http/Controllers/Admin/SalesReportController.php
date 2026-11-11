<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SalesReportController extends Controller
{
    private const REVENUE_STATUSES = ['confirmed', 'shipped', 'delivered'];

    public function index(Request $request): Response
    {
        [$from, $to] = $this->dateRange($request);
        $orders = $this->ordersForRange($from, $to);

        $summary = (clone $orders)
            ->selectRaw('COUNT(*) as orders_count, COALESCE(SUM(total), 0) as revenue')
            ->first();

        $dailySales = (clone $orders)
            ->selectRaw('DATE(created_at) as date, COUNT(*) as orders_count, SUM(total) as revenue')
            ->groupByRaw('DATE(created_at)')
            ->orderByRaw('DATE(created_at) DESC')
            ->get();

        $topProducts = DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->whereIn('orders.status', self::REVENUE_STATUSES)
            ->whereBetween('orders.created_at', [$from->startOfDay(), $to->endOfDay()])
            ->selectRaw('order_items.product_name, SUM(order_items.quantity) as quantity, SUM(order_items.line_total) as revenue')
            ->groupBy('order_items.product_name')
            ->orderByDesc('revenue')
            ->limit(10)
            ->get();

        return Inertia::render('admin/reports/sales', [
            'filters' => [
                'from' => $from->toDateString(),
                'to' => $to->toDateString(),
            ],
            'summary' => [
                'orders' => (int) $summary->orders_count,
                'revenue' => (float) $summary->revenue,
                'items_sold' => (int) (clone $orders)
                    ->join('order_items', 'order_items.order_id', '=', 'orders.id')
                    ->sum('order_items.quantity'),
                'average_order' => (int) $summary->orders_count > 0
                    ? (float) $summary->revenue / (int) $summary->orders_count
                    : 0,
            ],
            'dailySales' => $dailySales,
            'topProducts' => $topProducts,
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        [$from, $to] = $this->dateRange($request);
        $orders = $this->ordersForRange($from, $to)->orderBy('created_at');

        return response()->streamDownload(function () use ($orders): void {
            $output = fopen('php://output', 'wb');
            fputcsv($output, ['Date', 'Order number', 'Customer', 'Status', 'Items', 'Revenue']);

            $orders->with('items')->chunk(200, function ($batch) use ($output): void {
                foreach ($batch as $order) {
                    fputcsv($output, [
                        $order->created_at->toDateString(),
                        $order->order_number,
                        $order->customer_name,
                        $order->status,
                        $order->items->sum('quantity'),
                        $order->total,
                    ]);
                }
            });

            fclose($output);
        }, "sales-report-{$from->toDateString()}-to-{$to->toDateString()}.csv", [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    /**
     * @return array{0: CarbonImmutable, 1: CarbonImmutable}
     */
    private function dateRange(Request $request): array
    {
        $validated = $request->validate([
            'from' => ['nullable', 'date_format:Y-m-d'],
            'to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:from'],
        ]);

        $today = CarbonImmutable::today();
        $from = isset($validated['from'])
            ? CarbonImmutable::createFromFormat('Y-m-d', $validated['from'])
            : $today->startOfMonth();
        $to = isset($validated['to'])
            ? CarbonImmutable::createFromFormat('Y-m-d', $validated['to'])
            : $today;

        return [$from, $to];
    }

    private function ordersForRange(CarbonImmutable $from, CarbonImmutable $to): Builder
    {
        return Order::query()
            ->whereIn('status', self::REVENUE_STATUSES)
            ->whereBetween('orders.created_at', [$from->startOfDay(), $to->endOfDay()]);
    }
}
