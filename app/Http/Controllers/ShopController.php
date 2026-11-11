<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShopController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Product::query()
            ->with([
                'category:id,name,slug,parent_id',
                'category.parent:id,name,slug',
                'colors:id,product_id,name,hex',
                'sizes:id,product_id,name',
                'variants:id,product_id,product_color_id,product_size_id,stock',
            ])
            ->withExists(['colors as has_colors', 'sizes as has_sizes'])
            ->where('is_active', true);

        if ($search = $request->string('q')->trim()->toString()) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('brand', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($categorySlug = $request->string('category')->trim()->toString()) {
            $category = Category::query()
                ->where('slug', $categorySlug)
                ->where('is_active', true)
                ->with('children')
                ->first();

            if ($category) {
                $ids = $category->selfAndDescendantIds();
                $query->whereIn('category_id', $ids);
            } else {
                $query->whereRaw('1 = 0');
            }
        }

        if ($age = $request->string('age')->trim()->toString()) {
            $query->where('age_range', $age);
        }

        $sort = $request->string('sort')->toString() ?: 'newest';
        match ($sort) {
            'price_asc' => $query->orderBy('price'),
            'price_desc' => $query->orderByDesc('price'),
            'name' => $query->orderBy('name'),
            default => $query->latest(),
        };

        return Inertia::render('shop/index', [
            'products' => $query->paginate(12)->withQueryString(),
            'categories' => Category::query()
                ->whereNull('parent_id')
                ->where('is_active', true)
                ->with([
                    'children' => fn ($q) => $q
                        ->where('is_active', true)
                        ->orderByDesc('sort_order')
                        ->orderByDesc('id')
                        ->select(['id', 'name', 'slug', 'parent_id']),
                ])
                ->orderByDesc('sort_order')
                ->orderByDesc('id')
                ->get(['id', 'name', 'slug']),
            'filters' => [
                'q' => $search ?: null,
                'category' => $categorySlug ?: null,
                'age' => $age ?: null,
                'sort' => $sort,
            ],
            'ageRanges' => Product::query()
                ->where('is_active', true)
                ->whereNotNull('age_range')
                ->distinct()
                ->orderBy('age_range')
                ->pluck('age_range'),
        ]);
    }

    public function show(string $slug): Response
    {
        $product = Product::query()
            ->with([
                'category:id,name,slug,parent_id',
                'category.parent:id,name,slug',
                'colors.images',
                'sizes',
                'variants',
            ])
            ->where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        $related = Product::query()
            ->with([
                'category:id,name,slug',
                'colors:id,product_id,name,hex',
                'sizes:id,product_id,name',
                'variants:id,product_id,product_color_id,product_size_id,stock',
            ])
            ->withExists(['colors as has_colors', 'sizes as has_sizes'])
            ->where('is_active', true)
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->take(4)
            ->get();

        return Inertia::render('shop/show', [
            'product' => $product,
            'related' => $related,
        ]);
    }
}
