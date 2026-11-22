<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WishlistController extends Controller
{
    public function index(Request $request): Response
    {
        $products = $request->user()
            ->wishlist()
            ->with([
                'category:id,name,slug',
                'colors:id,product_id,name,hex',
                'sizes:id,product_id,name',
                'variants:id,product_id,product_color_id,product_size_id,stock',
            ])
            ->withExists(['colors as has_colors', 'sizes as has_sizes'])
            ->where('is_active', true)
            ->latest('wishlists.created_at')
            ->get();

        return Inertia::render('wishlist/index', [
            'products' => $products,
        ]);
    }

    public function toggle(Request $request, Product $product): RedirectResponse
    {
        $request->user()->wishlist()->toggle($product->id);

        return back(fallback: '/wishlist');
    }
}
