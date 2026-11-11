<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class BulkProductUploadTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_preview_and_import_a_csv_product_file(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $category = Category::create([
            'name' => 'Baby Care',
            'slug' => 'baby-care',
        ]);
        $csv = UploadedFile::fake()->createWithContent(
            'products.csv',
            "name,category,price,stock,description,brand,age_range,compare_at_price,image_url,is_featured,is_active\n".
            "Soft Blanket,baby-care,850,12,Soft cotton,BabuBazer,0-12 months,1000,https://example.test/blanket.jpg,true,true\n".
            "Soft Hat,baby-care,850,8,,,,,,,\n",
        );

        $this->actingAs($admin)
            ->post('/admin/products/import', [
                'action' => 'preview',
                'csv_file' => $csv,
            ])
            ->assertRedirect('/admin/products/import');

        $this->get('/admin/products/import')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('preview.can_import', true)
                ->where('preview.rows.0.category', 'Baby Care')
                ->where('preview.rows.0.name', 'Soft Blanket'));

        $this->actingAs($admin)
            ->post('/admin/products/import', ['action' => 'import'])
            ->assertRedirect('/admin/products');

        $this->assertDatabaseHas('products', [
            'category_id' => $category->id,
            'name' => 'Soft Blanket',
            'slug' => 'soft-blanket',
            'price' => 850,
            'stock' => 12,
            'image' => 'https://example.test/blanket.jpg',
            'is_featured' => true,
        ]);
        $this->assertDatabaseHas('products', [
            'category_id' => $category->id,
            'name' => 'Soft Hat',
            'slug' => 'soft-hat',
            'compare_at_price' => null,
            'is_featured' => false,
            'is_active' => true,
        ]);
        $this->assertSame(2, Product::count());
    }

    public function test_admin_can_import_multiple_color_and_size_combinations_for_one_product(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        Category::create(['name' => 'Baby Care', 'slug' => 'baby-care']);
        $csv = UploadedFile::fake()->createWithContent(
            'variants.csv',
            "name,category,price,product_key,color,color_hex,size,variant_stock,color_image_url\n".
            "Soft Blanket,baby-care,850,blanket,Cream,#f5e6c8,Small,8,https://images.example/cream.jpg\n".
            "Soft Blanket,baby-care,850,blanket,Cream,#f5e6c8,Large,6,https://images.example/cream.jpg\n".
            "Soft Blanket,baby-care,850,blanket,Blue,#7db5e8,Small,5,https://images.example/blue.jpg\n".
            "Soft Blanket,baby-care,850,blanket,Blue,#7db5e8,Large,4,https://images.example/blue.jpg\n",
        );

        $this->actingAs($admin)
            ->post('/admin/products/import', [
                'action' => 'preview',
                'csv_file' => $csv,
            ])
            ->assertRedirect('/admin/products/import');

        $this->get('/admin/products/import')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('preview.can_import', true)
                ->where('preview.products_count', 1)
                ->where('preview.rows.0.color', 'Cream')
                ->where('preview.rows.0.size', 'Small'));

        $this->actingAs($admin)
            ->post('/admin/products/import', ['action' => 'import'])
            ->assertRedirect('/admin/products');

        $product = Product::with(['colors.images', 'sizes', 'variants'])->firstOrFail();
        $this->assertSame(4, $product->variants->count());
        $this->assertSame(23, $product->stock);
        $this->assertSame(2, $product->colors->count());
        $this->assertSame(2, $product->sizes->count());
        $this->assertSame(2, $product->colors->sum(fn ($color) => $color->images->count()));
        $this->assertDatabaseHas('product_variants', [
            'product_id' => $product->id,
            'stock' => 8,
        ]);
    }

    public function test_preview_rejects_rows_with_unknown_categories(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $csv = UploadedFile::fake()->createWithContent(
            'products.csv',
            "name,category,price,stock\nUnknown item,missing-category,100,2\n",
        );

        $this->actingAs($admin)
            ->post('/admin/products/import', [
                'action' => 'preview',
                'csv_file' => $csv,
            ])
            ->assertRedirect('/admin/products/import');

        $this->get('/admin/products/import')
            ->assertInertia(fn (Assert $page) => $page
                ->where('preview.can_import', false)
                ->has('preview.rows.0.errors'));

        $this->actingAs($admin)
            ->post('/admin/products/import', ['action' => 'import'])
            ->assertRedirect('/admin/products/import')
            ->assertSessionHas('error');

        $this->assertDatabaseCount('products', 0);
    }

    public function test_admin_can_get_the_csv_template(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $this->actingAs($admin)
            ->get('/admin/products/import/template')
            ->assertOk()
            ->assertHeader('content-type', 'text/csv; charset=UTF-8');
    }
}
