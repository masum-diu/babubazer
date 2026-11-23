<?php

namespace App\Http\Middleware;

use App\Models\Category;
use App\Models\SitePage;
use App\Services\CartService;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $cart = app(CartService::class);

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user()
                    ? [
                        'id' => $request->user()->id,
                        'name' => $request->user()->name,
                        'email' => $request->user()->email,
                        'phone' => $request->user()->phone,
                        'is_admin' => (bool) $request->user()->is_admin,
                    ]
                    : null,
            ],
            'cartCount' => $cart->count($request),
            'guest' => ! $request->user() && (bool) $request->session()->get('guest_checkout'),
            'wishlistIds' => function () use ($request) {
                if (! $request->user()) {
                    return [];
                }

                try {
                    return $request->user()->wishlist()->pluck('products.id')->all();
                } catch (\Throwable) {
                    // e.g. migration not applied yet: never break page rendering over the heart icon
                    return [];
                }
            },
            'topbar' => fn () => SitePage::content('topbar'),
            'navbar' => fn () => SitePage::content('navbar'),
            'footer' => fn () => SitePage::content('footer'),
            'sidebarCategories' => fn () => $request->is('admin*')
                ? []
                : Category::query()
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
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'info' => fn () => $request->session()->get('info'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
