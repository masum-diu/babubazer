<?php

namespace Tests\Feature;

use App\Models\CartItem;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminProductCatalogTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_catalog_is_paginated(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $category = Category::create([
            'name' => 'Baby Care',
            'slug' => 'baby-care',
        ]);

        foreach (range(1, 17) as $index) {
            Product::create([
                'category_id' => $category->id,
                'name' => "Product {$index}",
                'slug' => "product-{$index}",
                'price' => 100,
                'stock' => 5,
            ]);
        }

        $this->actingAs($admin)
            ->get('/admin/products?page=2')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('products.data', 2)
                ->where('products.current_page', 2)
                ->where('products.per_page', 15)
                ->where('products.total', 17)
                ->where('products.from', 16)
                ->where('products.to', 17)
                ->has('products.links'));
    }

    public function test_admin_can_delete_all_products_while_preserving_order_history(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $category = Category::create([
            'name' => 'Baby Care',
            'slug' => 'baby-care',
        ]);
        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Soft Blanket',
            'slug' => 'soft-blanket',
            'price' => 850,
            'stock' => 12,
        ]);
        $cartItem = CartItem::create([
            'session_id' => 'test-session',
            'product_id' => $product->id,
            'quantity' => 1,
        ]);
        $order = Order::create([
            'order_number' => 'BB-TEST-1',
            'customer_name' => 'Test Customer',
            'customer_email' => 'test@example.com',
            'customer_phone' => '0123456789',
            'shipping_address' => 'Test address',
            'city' => 'Dhaka',
            'subtotal' => 850,
            'shipping_fee' => 0,
            'total' => 850,
        ]);
        $orderItem = OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'product_name' => $product->name,
            'unit_price' => 850,
            'quantity' => 1,
            'line_total' => 850,
        ]);

        $this->actingAs($admin)
            ->delete('/admin/products')
            ->assertRedirect('/admin/products')
            ->assertSessionHas('success', '1 products deleted.');

        $this->assertDatabaseCount('products', 0);
        $this->assertDatabaseMissing('cart_items', ['id' => $cartItem->id]);
        $this->assertDatabaseHas('order_items', [
            'id' => $orderItem->id,
            'product_id' => null,
            'product_name' => 'Soft Blanket',
        ]);
    }

    public function test_guest_cannot_delete_all_products(): void
    {
        $category = Category::create([
            'name' => 'Baby Care',
            'slug' => 'baby-care',
        ]);
        Product::create([
            'category_id' => $category->id,
            'name' => 'Soft Blanket',
            'slug' => 'soft-blanket',
            'price' => 850,
            'stock' => 12,
        ]);

        $this->delete('/admin/products')->assertRedirect('/admin');

        $this->assertDatabaseCount('products', 1);
    }
}
