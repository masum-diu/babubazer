<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\SitePage;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(): Response
    {
        $content = SitePage::content('home');

        return Inertia::render('home', [
            'content' => $content,
            'bannerSlides' => $content['banner_slides'] ?? [],
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
                ->get(['id', 'name', 'slug', 'description', 'image']),
            'featured' => Product::query()
                ->with([
                    'category:id,name,slug',
                    'colors:id,product_id,name,hex',
                    'sizes:id,product_id,name',
                    'variants:id,product_id,product_color_id,product_size_id,stock',
                ])
                ->withExists(['colors as has_colors', 'sizes as has_sizes'])
                ->where('is_active', true)
                ->where('is_featured', true)
                ->latest()
                ->take(8)
                ->get(),
        ]);
    }
}
