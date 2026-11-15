<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminInventoryTest extends TestCase
{
    use RefreshDatabase;

    private function product(int $stock): Product
    {
        $category = Category::create(['name' => 'Toys', 'slug' => 'toys']);

        return Product::create([
            'category_id' => $category->id,
            'name' => 'Rattle',
            'slug' => 'rattle',
            'price' => 100,
            'stock' => $stock,
        ]);
    }

    public function test_admin_can_set_and_add_stock_and_changes_are_logged(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $product = $this->product(10);

        $this->actingAs($admin)->patch('/admin/inventory/stock', [
            'product_id' => $product->id,
            'mode' => 'set',
            'quantity' => 3,
        ])->assertSessionHas('success');

        $this->actingAs($admin)->patch('/admin/inventory/stock', [
            'product_id' => $product->id,
            'mode' => 'add',
            'quantity' => -10,
            'reason' => 'Damaged',
        ]);

        $this->assertSame(0, $product->fresh()->stock);
        $this->assertSame(2, StockMovement::count());
        $this->assertDatabaseHas('stock_movements', ['change' => -3, 'stock_after' => 0, 'reason' => 'Damaged']);
    }

    public function test_low_stock_filter_and_dashboard_summary(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $this->product(2);

        $this->actingAs($admin)->get('/admin/inventory?status=low')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('products.data', 1)
                ->where('summary.low', 1));

        $this->actingAs($admin)->get('/admin/inventory?status=in')
            ->assertInertia(fn (Assert $page) => $page->has('products.data', 0));

        $this->actingAs($admin)->get('/admin/dashboard')
            ->assertInertia(fn (Assert $page) => $page->has('lowStock', 1));
    }

    public function test_cancelling_an_order_restores_stock_and_reopening_deducts_it(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $product = $this->product(5);

        $order = Order::create([
            'order_number' => 'BB-TEST-1',
            'customer_name' => 'A',
            'customer_email' => 'a@example.com',
            'customer_phone' => '0170',
            'shipping_address' => 'x',
            'division' => 'Dhaka',
            'city' => 'Dhaka',
            'payment_method' => 'cod',
            'status' => 'pending',
            'subtotal' => 200,
            'shipping_fee' => 0,
            'total' => 200,
        ]);
        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'product_name' => 'Rattle',
            'unit_price' => 100,
            'quantity' => 2,
            'line_total' => 200,
        ]);

        $this->actingAs($admin)->patch("/admin/orders/{$order->id}", ['status' => 'cancelled']);
        $this->assertSame(7, $product->fresh()->stock);

        $this->actingAs($admin)->patch("/admin/orders/{$order->id}", ['status' => 'confirmed']);
        $this->assertSame(5, $product->fresh()->stock);
    }
}
