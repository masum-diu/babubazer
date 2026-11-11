<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminSalesReportTest extends TestCase
{
    use RefreshDatabase;

    public function test_report_filters_to_date_range_and_revenue_statuses(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $this->createSale('confirmed', '2026-11-05 10:00:00', 1500, 'Baby blanket', 2);
        $this->createSale('delivered', '2026-11-06 12:00:00', 500, 'Baby hat', 1);
        $this->createSale('pending', '2026-11-06 13:00:00', 900, 'Pending item', 1);
        $this->createSale('cancelled', '2026-11-06 14:00:00', 700, 'Cancelled item', 1);
        $this->createSale('shipped', '2026-10-31 14:00:00', 300, 'Outside range', 1);

        $this->actingAs($admin)
            ->get('/admin/reports/sales?from=2026-11-01&to=2026-11-30')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('summary.orders', 2)
                ->where('summary.revenue', 2000)
                ->where('summary.items_sold', 3)
                ->where('summary.average_order', 1000)
                ->has('dailySales', 2)
                ->where('topProducts.0.product_name', 'Baby blanket')
                ->where('filters.from', '2026-11-01')
                ->where('filters.to', '2026-11-30'));
    }

    public function test_sales_report_exports_filtered_orders_as_csv(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $this->createSale('confirmed', '2026-11-05 10:00:00', 1500, 'Baby blanket', 2);
        $this->createSale('pending', '2026-11-05 12:00:00', 900, 'Pending item', 1);

        $this->actingAs($admin)
            ->get('/admin/reports/sales/export?from=2026-11-01&to=2026-11-30')
            ->assertOk()
            ->assertHeader('content-type', 'text/csv; charset=UTF-8')
            ->assertStreamedContent(
                "Date,\"Order number\",Customer,Status,Items,Revenue\n".
                "2026-11-05,TEST-1,\"Report customer\",confirmed,2,1500.00\n",
            );
    }

    public function test_guest_cannot_access_sales_report(): void
    {
        $this->get('/admin/reports/sales')->assertRedirect('/admin');
    }

    private function createSale(
        string $status,
        string $createdAt,
        int $total,
        string $productName,
        int $quantity,
    ): Order {
        $order = Order::create([
            'order_number' => 'TEST-'.Order::count() + 1,
            'customer_name' => 'Report customer',
            'customer_email' => 'report@example.com',
            'customer_phone' => '0123456789',
            'shipping_address' => 'Report address',
            'city' => 'Dhaka',
            'status' => $status,
            'subtotal' => $total,
            'shipping_fee' => 0,
            'total' => $total,
        ]);
        $order->forceFill([
            'created_at' => Carbon::parse($createdAt),
            'updated_at' => Carbon::parse($createdAt),
        ])->save();
        OrderItem::create([
            'order_id' => $order->id,
            'product_name' => $productName,
            'unit_price' => $total / $quantity,
            'quantity' => $quantity,
            'line_total' => $total,
        ]);

        return $order;
    }
}
