<?php

namespace App\Services;

use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class CartService
{
    public function sessionKey(Request $request): string
    {
        if (! $request->session()->has('cart_token')) {
            $request->session()->put('cart_token', bin2hex(random_bytes(16)));
        }

        return (string) $request->session()->get('cart_token');
    }

    public function query(Request $request)
    {
        $user = $request->user();

        return CartItem::query()
            ->with(['product.category', 'color.images', 'size', 'variant'])
            ->when(
                $user,
                fn ($q) => $q->where('user_id', $user->id),
                fn ($q) => $q->where('session_id', $this->sessionKey($request)),
            );
    }

    public function items(Request $request): Collection
    {
        return $this->query($request)->get();
    }

    public function count(Request $request): int
    {
        return (int) $this->query($request)->sum('quantity');
    }

    public function add(
        Request $request,
        Product $product,
        int $quantity = 1,
        ?int $colorId = null,
        ?int $sizeId = null,
    ): CartItem {
        $quantity = max(1, $quantity);
        $user = $request->user();
        $sessionId = $this->sessionKey($request);

        $variant = $product->findVariant($colorId, $sizeId);
        $maxStock = $variant ? (int) $variant->stock : (int) $product->stock;

        abort_if($maxStock < 1, 422, 'Out of stock');

        $item = $this->query($request)
            ->where('product_id', $product->id)
            ->when(
                $colorId,
                fn ($q) => $q->where('product_color_id', $colorId),
                fn ($q) => $q->whereNull('product_color_id'),
            )
            ->when(
                $sizeId,
                fn ($q) => $q->where('product_size_id', $sizeId),
                fn ($q) => $q->whereNull('product_size_id'),
            )
            ->first();

        if ($item) {
            $item->update([
                'quantity' => min($maxStock, $item->quantity + $quantity),
                'product_variant_id' => $variant?->id,
            ]);

            return $item->fresh(['product.category', 'color.images', 'size', 'variant']);
        }

        return CartItem::create([
            'user_id' => $user?->id,
            'session_id' => $user ? null : $sessionId,
            'product_id' => $product->id,
            'product_color_id' => $colorId,
            'product_size_id' => $sizeId,
            'product_variant_id' => $variant?->id,
            'quantity' => min($maxStock, $quantity),
        ])->load(['product.category', 'color.images', 'size', 'variant']);
    }

    public function update(Request $request, CartItem $item, int $quantity): void
    {
        $this->assertOwns($request, $item);

        if ($quantity <= 0) {
            $item->delete();

            return;
        }

        $maxStock = $item->variant
            ? (int) $item->variant->stock
            : (int) $item->product->stock;

        $item->update([
            'quantity' => min($maxStock, $quantity),
        ]);
    }

    public function remove(Request $request, CartItem $item): void
    {
        $this->assertOwns($request, $item);
        $item->delete();
    }

    public function clear(Request $request): void
    {
        $this->query($request)->delete();
    }

    public function mergeSessionCart(Request $request): void
    {
        $user = $request->user();

        if (! $user) {
            return;
        }

        $sessionId = $this->sessionKey($request);

        DB::transaction(function () use ($user, $sessionId) {
            $guestItems = CartItem::query()
                ->where('session_id', $sessionId)
                ->whereNull('user_id')
                ->get();

            foreach ($guestItems as $guestItem) {
                $existing = CartItem::query()
                    ->where('user_id', $user->id)
                    ->where('product_id', $guestItem->product_id)
                    ->when(
                        $guestItem->product_color_id,
                        fn ($q) => $q->where('product_color_id', $guestItem->product_color_id),
                        fn ($q) => $q->whereNull('product_color_id'),
                    )
                    ->when(
                        $guestItem->product_size_id,
                        fn ($q) => $q->where('product_size_id', $guestItem->product_size_id),
                        fn ($q) => $q->whereNull('product_size_id'),
                    )
                    ->first();

                if ($existing) {
                    $existing->update([
                        'quantity' => $existing->quantity + $guestItem->quantity,
                    ]);
                    $guestItem->delete();
                } else {
                    $guestItem->update([
                        'user_id' => $user->id,
                        'session_id' => null,
                    ]);
                }
            }
        });
    }

    public function summary(Request $request): array
    {
        $items = $this->items($request)->filter(fn (CartItem $item) => $item->product !== null);

        $lines = $items->map(function (CartItem $item) {
            $product = $item->product;
            $lineTotal = (float) $product->price * $item->quantity;
            $image = $item->color?->images?->first()?->path ?: $product->image;

            return [
                'id' => $item->id,
                'quantity' => $item->quantity,
                'line_total' => $lineTotal,
                'color' => $item->color ? [
                    'id' => $item->color->id,
                    'name' => $item->color->name,
                    'hex' => $item->color->hex,
                ] : null,
                'size' => $item->size ? [
                    'id' => $item->size->id,
                    'name' => $item->size->name,
                ] : null,
                'product' => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'price' => (float) $product->price,
                    'compare_at_price' => $product->compare_at_price !== null
                        ? (float) $product->compare_at_price
                        : null,
                    'image' => $image,
                    'stock' => $item->variant?->stock ?? $product->stock,
                    'brand' => $product->brand,
                    'age_range' => $product->age_range,
                ],
            ];
        })->values();

        $subtotal = (float) $lines->sum('line_total');
        // Cart estimate uses Dhaka rate; checkout recalculates by division.
        $shipping = $subtotal === 0.0
            ? 0.0
            : \App\Support\ShippingFee::forDivision('Dhaka');

        return [
            'items' => $lines,
            'count' => $lines->sum('quantity'),
            'subtotal' => $subtotal,
            'shipping_fee' => $shipping,
            'total' => $subtotal + $shipping,
            'shipping_rates' => \App\Support\ShippingFee::rates(),
        ];
    }

    protected function assertOwns(Request $request, CartItem $item): void
    {
        $user = $request->user();

        $owns = $user
            ? $item->user_id === $user->id
            : $item->session_id === $this->sessionKey($request);

        abort_unless($owns, 403);
    }
}
