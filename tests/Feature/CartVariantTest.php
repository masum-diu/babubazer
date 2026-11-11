<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductColor;
use App\Models\ProductVariant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CartVariantTest extends TestCase
{
    use RefreshDatabase;

    public function test_product_cards_expose_when_options_must_be_selected(): void
    {
        $category = Category::create([
            'name' => 'Toys',
            'slug' => 'toys',
        ]);
        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Colorful toy',
            'slug' => 'colorful-toy',
            'price' => 100,
            'stock' => 2,
            'is_active' => true,
        ]);
        $color = ProductColor::create([
            'product_id' => $product->id,
            'name' => 'Blue',
            'hex' => '#0000ff',
        ]);
        ProductVariant::create([
            'product_id' => $product->id,
            'product_color_id' => $color->id,
            'stock' => 2,
        ]);

        $this->get('/shop')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('products.data.0.has_colors', true)
                ->where('products.data.0.has_sizes', false)
                ->where('products.data.0.colors.0.name', 'Blue')
                ->where('products.data.0.variants.0.stock', 2));
    }

    public function test_add_to_cart_returns_a_validation_error_when_color_is_missing(): void
    {
        $category = Category::create([
            'name' => 'Toys',
            'slug' => 'toys',
        ]);
        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Colorful toy',
            'slug' => 'colorful-toy',
            'price' => 100,
            'stock' => 2,
            'is_active' => true,
        ]);
        ProductColor::create([
            'product_id' => $product->id,
            'name' => 'Blue',
        ]);

        $this->from('/shop')
            ->post('/cart', [
                'product_id' => $product->id,
                'quantity' => 1,
            ])
            ->assertRedirect('/shop')
            ->assertSessionHasErrors('product_color_id');
    }

    public function test_selected_product_color_is_added_to_cart(): void
    {
        $category = Category::create([
            'name' => 'Toys',
            'slug' => 'toys',
        ]);
        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Colorful toy',
            'slug' => 'colorful-toy',
            'price' => 100,
            'stock' => 2,
            'is_active' => true,
        ]);
        $color = ProductColor::create([
            'product_id' => $product->id,
            'name' => 'Blue',
        ]);
        ProductVariant::create([
            'product_id' => $product->id,
            'product_color_id' => $color->id,
            'stock' => 2,
        ]);

        $this->post('/cart', [
            'product_id' => $product->id,
            'quantity' => 1,
            'product_color_id' => $color->id,
        ])->assertRedirect();

        $this->assertDatabaseHas('cart_items', [
            'product_id' => $product->id,
            'product_color_id' => $color->id,
            'quantity' => 1,
        ]);
    }
}
