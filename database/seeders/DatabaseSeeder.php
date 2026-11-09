<?php

namespace Database\Seeders;

use App\Models\AttributeColor;
use App\Models\AttributeSize;
use App\Models\CartItem;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductColor;
use App\Models\ProductColorImage;
use App\Models\ProductSize;
use App\Models\ProductVariant;
use App\Models\SitePage;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::query()->updateOrCreate(
            ['email' => 'admin@babubazer.com'],
            [
                'name' => 'BabuBazer Admin',
                'phone' => '01700000000',
                'password' => 'password',
                'is_admin' => true,
            ],
        );

        User::query()->updateOrCreate(
            ['email' => 'customer@babubazer.com'],
            [
                'name' => 'Demo Customer',
                'phone' => '01800000000',
                'password' => 'password',
                'is_admin' => false,
            ],
        );

        SitePage::ensureDefaults();

        $this->seedAttributes();
        $this->resetCatalog();

        $man = Category::query()->create([
            'parent_id' => null,
            'name' => 'Man',
            'slug' => 'man',
            'description' => 'Baby boy clothing and essentials',
            'image' => 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80',
            'sort_order' => 2,
            'is_active' => true,
        ]);

        $women = Category::query()->create([
            'parent_id' => null,
            'name' => 'Women',
            'slug' => 'women',
            'description' => 'Baby girl clothing and essentials',
            'image' => 'https://images.unsplash.com/photo-1519689373023-dd07c7988603?w=800&q=80',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $manSubs = $this->seedSubcategories($man, [
            ['name' => 'Rompers', 'slug' => 'man-rompers', 'sort_order' => 4],
            ['name' => 'Sets', 'slug' => 'man-sets', 'sort_order' => 3],
            ['name' => 'Shoes', 'slug' => 'man-shoes', 'sort_order' => 2],
            ['name' => 'Winter Wear', 'slug' => 'man-winter', 'sort_order' => 1],
        ]);

        $womenSubs = $this->seedSubcategories($women, [
            ['name' => 'Dresses', 'slug' => 'women-dresses', 'sort_order' => 4],
            ['name' => 'Sets', 'slug' => 'women-sets', 'sort_order' => 3],
            ['name' => 'Shoes', 'slug' => 'women-shoes', 'sort_order' => 2],
            ['name' => 'Accessories', 'slug' => 'women-accessories', 'sort_order' => 1],
        ]);

        $this->seedProduct($manSubs['man-rompers'], [
            'name' => 'Soft Cotton Boy Romper',
            'slug' => 'soft-cotton-boy-romper',
            'brand' => 'TinyThread',
            'age_range' => '0-6 months',
            'price' => 890,
            'compare_at_price' => 1050,
            'is_featured' => true,
            'image' => 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80',
            'description' => 'Breathable cotton romper for baby boys with easy snap buttons.',
            'colors' => [
                ['name' => 'Sky Blue', 'hex' => '#7eb6d9', 'image' => 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80'],
                ['name' => 'Navy', 'hex' => '#1e3a5f', 'image' => 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80'],
                ['name' => 'Grey', 'hex' => '#9aa0a6', 'image' => 'https://images.unsplash.com/photo-1519689373023-dd07c7988603?w=800&q=80'],
            ],
            'sizes' => ['0-3M', '3-6M', '6-9M'],
        ]);

        $this->seedProduct($manSubs['man-sets'], [
            'name' => 'Boy Everyday Wear Set',
            'slug' => 'boy-everyday-wear-set',
            'brand' => 'TinyThread',
            'age_range' => '6-18 months',
            'price' => 1450,
            'compare_at_price' => 1690,
            'is_featured' => true,
            'image' => 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80',
            'description' => '2-piece soft set for baby boys — tee + pant.',
            'colors' => [
                ['name' => 'Blue', 'hex' => '#4a90d9', 'image' => 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80'],
                ['name' => 'Green', 'hex' => '#5f8f6b', 'image' => 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80'],
            ],
            'sizes' => ['6-12M', '12-18M', '18-24M'],
        ]);

        $this->seedProduct($manSubs['man-shoes'], [
            'name' => 'Baby Boy Soft Sole Shoes',
            'slug' => 'baby-boy-soft-sole-shoes',
            'brand' => 'LittleStep',
            'age_range' => '6-24 months',
            'price' => 780,
            'compare_at_price' => null,
            'is_featured' => false,
            'image' => 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80',
            'description' => 'Soft-sole first shoes with anti-slip base for baby boys.',
            'colors' => [
                ['name' => 'Brown', 'hex' => '#5b7c99', 'image' => 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80'],
                ['name' => 'Brown', 'hex' => '#8b5e3c', 'image' => 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80'],
            ],
            'sizes' => ['Size 16', 'Size 17', 'Size 18'],
        ]);

        $this->seedProduct($manSubs['man-winter'], [
            'name' => 'Boy Fleece Hoodie Jumpsuit',
            'slug' => 'boy-fleece-hoodie-jumpsuit',
            'brand' => 'CozyNest',
            'age_range' => '3-18 months',
            'price' => 1650,
            'compare_at_price' => 1890,
            'is_featured' => true,
            'image' => 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800&q=80',
            'description' => 'Warm fleece jumpsuit with hood for baby boys in cooler weather.',
            'colors' => [
                ['name' => 'Navy', 'hex' => '#1c2e4a', 'image' => 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800&q=80'],
                ['name' => 'Mustard', 'hex' => '#d4a017', 'image' => 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&q=80'],
            ],
            'sizes' => ['3-6M', '6-12M', '12-18M'],
        ]);

        $this->seedProduct($womenSubs['women-dresses'], [
            'name' => 'Baby Girl Cotton Frock',
            'slug' => 'baby-girl-cotton-frock',
            'brand' => 'LittleBloom',
            'age_range' => '3-12 months',
            'price' => 980,
            'compare_at_price' => 1190,
            'is_featured' => true,
            'image' => 'https://images.unsplash.com/photo-1519689373023-dd07c7988603?w=800&q=80',
            'description' => 'Soft cotton frock with gentle frill for baby girls.',
            'colors' => [
                ['name' => 'Pink', 'hex' => '#f2a1b3', 'image' => 'https://images.unsplash.com/photo-1519689373023-dd07c7988603?w=800&q=80'],
                ['name' => 'Lilac', 'hex' => '#c7a6d9', 'image' => 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&q=80'],
                ['name' => 'White', 'hex' => '#f7f4ef', 'image' => 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=900&q=80'],
            ],
            'sizes' => ['3-6M', '6-9M', '9-12M'],
        ]);

        $this->seedProduct($womenSubs['women-sets'], [
            'name' => 'Girl Ruffle Top & Pant Set',
            'slug' => 'girl-ruffle-top-pant-set',
            'brand' => 'LittleBloom',
            'age_range' => '6-24 months',
            'price' => 1350,
            'compare_at_price' => 1550,
            'is_featured' => true,
            'image' => 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=900&q=80',
            'description' => 'Cute 2-piece set with soft ruffle detail for baby girls.',
            'colors' => [
                ['name' => 'Peach', 'hex' => '#f5c6aa', 'image' => 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=900&q=80'],
                ['name' => 'Mint', 'hex' => '#9fd5c5', 'image' => 'https://images.unsplash.com/photo-1519689373023-dd07c7988603?w=800&q=80'],
            ],
            'sizes' => ['6-12M', '12-18M', '18-24M'],
        ]);

        $this->seedProduct($womenSubs['women-shoes'], [
            'name' => 'Baby Girl Soft Sandals',
            'slug' => 'baby-girl-soft-sandals',
            'brand' => 'LittleStep',
            'age_range' => '6-24 months',
            'price' => 720,
            'compare_at_price' => null,
            'is_featured' => false,
            'image' => 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80',
            'description' => 'Light soft sandals with velcro strap for baby girls.',
            'colors' => [
                ['name' => 'Pink', 'hex' => '#e8a0b0', 'image' => 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80'],
                ['name' => 'White', 'hex' => '#f5f5f5', 'image' => 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=900&q=80'],
            ],
            'sizes' => ['Size 16', 'Size 17', 'Size 18'],
        ]);

        $this->seedProduct($womenSubs['women-accessories'], [
            'name' => 'Baby Girl Headband Pack',
            'slug' => 'baby-girl-headband-pack',
            'brand' => 'LittleBloom',
            'age_range' => '0-24 months',
            'price' => 450,
            'compare_at_price' => 550,
            'is_featured' => true,
            'image' => 'https://images.unsplash.com/photo-1519689373023-dd07c7988603?w=800&q=80',
            'description' => 'Soft stretch headband 3-pack for baby girls.',
            'colors' => [
                ['name' => 'Rose Mix', 'hex' => '#d9899b', 'image' => 'https://images.unsplash.com/photo-1519689373023-dd07c7988603?w=800&q=80'],
                ['name' => 'Cream Mix', 'hex' => '#efe6d9', 'image' => 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&q=80'],
            ],
            'sizes' => ['One Size'],
        ]);
    }

    protected function seedAttributes(): void
    {
        $colors = [
            ['name' => 'Sky Blue', 'hex' => '#7eb6d9', 'sort_order' => 10],
            ['name' => 'Navy', 'hex' => '#1e3a5f', 'sort_order' => 9],
            ['name' => 'Grey', 'hex' => '#9aa0a6', 'sort_order' => 8],
            ['name' => 'Pink', 'hex' => '#f2a1b3', 'sort_order' => 7],
            ['name' => 'White', 'hex' => '#f7f4ef', 'sort_order' => 6],
            ['name' => 'Peach', 'hex' => '#f5c6aa', 'sort_order' => 5],
            ['name' => 'Mint', 'hex' => '#9fd5c5', 'sort_order' => 4],
            ['name' => 'Mustard', 'hex' => '#d4a017', 'sort_order' => 3],
            ['name' => 'Black', 'hex' => '#222222', 'sort_order' => 2],
            ['name' => 'Brown', 'hex' => '#8b5e3c', 'sort_order' => 1],
        ];

        foreach ($colors as $color) {
            AttributeColor::query()->updateOrCreate(
                ['name' => $color['name']],
                [...$color, 'is_active' => true],
            );
        }

        $sizes = [
            ['name' => '0-3M', 'sort_order' => 10],
            ['name' => '3-6M', 'sort_order' => 9],
            ['name' => '6-9M', 'sort_order' => 8],
            ['name' => '6-12M', 'sort_order' => 7],
            ['name' => '9-12M', 'sort_order' => 6],
            ['name' => '12-18M', 'sort_order' => 5],
            ['name' => '18-24M', 'sort_order' => 4],
            ['name' => 'S', 'sort_order' => 3],
            ['name' => 'M', 'sort_order' => 2],
            ['name' => 'L', 'sort_order' => 1],
            ['name' => 'One Size', 'sort_order' => 0],
        ];

        foreach ($sizes as $size) {
            AttributeSize::query()->updateOrCreate(
                ['name' => $size['name']],
                [...$size, 'is_active' => true],
            );
        }
    }

    protected function resetCatalog(): void
    {
        DB::transaction(function () {
            CartItem::query()->delete();
            OrderItem::query()->delete();
            Order::query()->delete();
            ProductVariant::query()->delete();
            ProductColorImage::query()->delete();
            ProductColor::query()->delete();
            ProductSize::query()->delete();
            Product::query()->delete();
            Category::query()->delete();
        });
    }

    /**
     * @param  array<int, array{name:string,slug:string,sort_order:int}>  $items
     * @return array<string, Category>
     */
    protected function seedSubcategories(Category $parent, array $items): array
    {
        $map = [];

        foreach ($items as $item) {
            $map[$item['slug']] = Category::query()->create([
                'parent_id' => $parent->id,
                'name' => $item['name'],
                'slug' => $item['slug'],
                'description' => $item['name'].' for '.$parent->name,
                'image' => null,
                'sort_order' => $item['sort_order'],
                'is_active' => true,
            ]);
        }

        return $map;
    }

    /**
     * @param  array{
     *   name:string,
     *   slug:string,
     *   brand:string,
     *   age_range:string,
     *   price:int|float,
     *   compare_at_price:int|float|null,
     *   is_featured:bool,
     *   image:string,
     *   description:string,
     *   colors:array<int, array{name:string,hex:string,image:string}>,
     *   sizes:array<int, string>
     * }  $data
     */
    protected function seedProduct(Category $category, array $data): void
    {
        $product = Product::query()->create([
            'category_id' => $category->id,
            'name' => $data['name'],
            'slug' => $data['slug'],
            'description' => $data['description'],
            'brand' => $data['brand'],
            'age_range' => $data['age_range'],
            'price' => $data['price'],
            'compare_at_price' => $data['compare_at_price'],
            'stock' => 0,
            'image' => $data['image'],
            'gallery' => [$data['image']],
            'is_featured' => $data['is_featured'],
            'is_active' => true,
        ]);

        $colorModels = [];
        foreach ($data['colors'] as $index => $color) {
            $colorModel = ProductColor::query()->create([
                'product_id' => $product->id,
                'name' => $color['name'],
                'hex' => $color['hex'],
                'sort_order' => $index,
            ]);

            ProductColorImage::query()->create([
                'product_color_id' => $colorModel->id,
                'path' => $color['image'],
                'sort_order' => 0,
            ]);

            ProductColorImage::query()->create([
                'product_color_id' => $colorModel->id,
                'path' => $data['image'],
                'sort_order' => 1,
            ]);

            $colorModels[] = $colorModel;
        }

        $sizeModels = [];
        foreach ($data['sizes'] as $index => $sizeName) {
            $sizeModels[] = ProductSize::query()->create([
                'product_id' => $product->id,
                'name' => $sizeName,
                'sort_order' => $index,
            ]);
        }

        $totalStock = 0;
        foreach ($colorModels as $colorModel) {
            foreach ($sizeModels as $sizeModel) {
                $stock = 10;
                ProductVariant::query()->create([
                    'product_id' => $product->id,
                    'product_color_id' => $colorModel->id,
                    'product_size_id' => $sizeModel->id,
                    'stock' => $stock,
                ]);
                $totalStock += $stock;
            }
        }

        $product->update(['stock' => $totalStock]);
    }
}
