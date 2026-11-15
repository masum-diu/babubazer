<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\StockMovement;
use Illuminate\Support\Facades\DB;

class StockService
{
    public static function threshold(): int
    {
        return (int) config('inventory.low_stock_threshold', 5);
    }

    /** Set an absolute quantity. Returns the change applied. */
    public static function set(
        Product $product,
        ?ProductVariant $variant,
        int $quantity,
        string $type,
        ?string $reason = null,
        ?Order $order = null,
        ?int $userId = null,
    ): int {
        return DB::transaction(function () use ($product, $variant, $quantity, $type, $reason, $order, $userId) {
            $quantity = max(0, $quantity);
            $current = $variant
                ? ProductVariant::lockForUpdate()->find($variant->id)
                : Product::lockForUpdate()->find($product->id);
            $change = $quantity - (int) $current->stock;

            if ($change === 0) {
                return 0;
            }

            $current->update(['stock' => $quantity]);

            if ($variant) {
                $product->syncStockFromVariants();
            }

            self::log($product, $variant, $type, $change, $quantity, $reason, $order, $userId);

            return $change;
        });
    }

    /** Add (or remove, if negative) stock. Never goes below zero. */
    public static function adjust(
        Product $product,
        ?ProductVariant $variant,
        int $delta,
        string $type,
        ?string $reason = null,
        ?Order $order = null,
        ?int $userId = null,
    ): int {
        $current = $variant
            ? (int) ProductVariant::find($variant->id)?->stock
            : (int) Product::find($product->id)?->stock;

        return self::set($product, $variant, $current + $delta, $type, $reason, $order, $userId);
    }

    /** Record a product-level total change (product form edit / import / create). */
    public static function logTotal(
        Product $product,
        int $before,
        string $type,
        ?string $reason = null,
        ?int $userId = null,
    ): void {
        $after = (int) $product->fresh()->stock;

        if ($after !== $before) {
            self::log($product, null, $type, $after - $before, $after, $reason, null, $userId);
        }
    }

    /** Give back stock for every line of a cancelled order. */
    public static function restoreOrder(Order $order, ?int $userId = null): void
    {
        foreach ($order->items as $item) {
            self::applyOrderLine($order, $item, (int) $item->quantity, 'cancel', 'Order cancelled', $userId);
        }
    }

    /** Take stock again for an order that was un-cancelled. */
    public static function deductOrder(Order $order, ?int $userId = null): void
    {
        foreach ($order->items as $item) {
            self::applyOrderLine($order, $item, -(int) $item->quantity, 'order', 'Order re-opened', $userId);
        }
    }

    public static function orderHasEnoughStock(Order $order): bool
    {
        foreach ($order->items as $item) {
            $available = $item->product_variant_id
                ? (int) ProductVariant::find($item->product_variant_id)?->stock
                : (int) Product::find($item->product_id)?->stock;

            if ($available < (int) $item->quantity) {
                return false;
            }
        }

        return true;
    }

    private static function applyOrderLine(Order $order, $item, int $delta, string $type, string $reason, ?int $userId): void
    {
        $product = $item->product_id ? Product::find($item->product_id) : null;

        if (! $product) {
            return;
        }

        $variant = $item->product_variant_id
            ? ProductVariant::find($item->product_variant_id)
            : null;

        self::adjust($product, $variant, $delta, $type, $reason, $order, $userId);
    }

    private static function log(
        Product $product,
        ?ProductVariant $variant,
        string $type,
        int $change,
        int $after,
        ?string $reason,
        ?Order $order,
        ?int $userId,
    ): void {
        StockMovement::create([
            'product_id' => $product->id,
            'product_variant_id' => $variant?->id,
            'product_name' => $product->name,
            'variant_label' => $variant ? self::variantLabel($variant) : null,
            'type' => $type,
            'change' => $change,
            'stock_after' => $after,
            'reason' => $reason,
            'order_id' => $order?->id,
            'user_id' => $userId ?? auth()->id(),
        ]);
    }

    public static function variantLabel(ProductVariant $variant): ?string
    {
        $bits = array_filter([$variant->color?->name, $variant->size?->name]);

        return $bits ? implode(' / ', $bits) : null;
    }
}
