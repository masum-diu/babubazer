<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\StockMovement;
use App\Services\StockService;
use Closure;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    public function index(Request $request): Response
    {
        $threshold = StockService::threshold();
        $status = $request->string('status')->toString();
        $search = trim($request->string('q')->toString());

        $query = Product::query()
            ->with(['category:id,name', 'variants.color', 'variants.size'])
            ->when($search !== '', fn ($q) => $q->where('name', 'like', "%{$search}%"))
            ->orderBy('name');

        match ($status) {
            'out' => $query->where($this->matchStock(fn ($q) => $q->where('stock', '<=', 0))),
            'low' => $query->where($this->matchStock(
                fn ($q) => $q->where('stock', '>', 0)->where('stock', '<=', $threshold),
            )),
            'in' => $query->where($this->matchStock(fn ($q) => $q->where('stock', '>', $threshold))),
            default => $status = 'all',
        };

        $products = $query->paginate(20)->withQueryString();

        $products->getCollection()->transform(fn (Product $product) => [
            'id' => $product->id,
            'name' => $product->name,
            'image' => $product->image,
            'category' => $product->category?->name,
            'stock' => (int) $product->stock,
            'variants' => $product->variants->map(fn (ProductVariant $variant) => [
                'id' => $variant->id,
                'label' => StockService::variantLabel($variant) ?? 'Default',
                'stock' => (int) $variant->stock,
            ])->values(),
        ]);

        return Inertia::render('admin/inventory/index', [
            'products' => $products,
            'filters' => ['status' => $status, 'q' => $search],
            'threshold' => $threshold,
            'summary' => self::summary(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'variant_id' => ['nullable', 'integer'],
            'mode' => ['required', Rule::in(['set', 'add'])],
            'quantity' => ['required', 'integer', 'min:-1000000', 'max:1000000'],
            'reason' => ['nullable', 'string', 'max:200'],
        ]);

        $product = Product::findOrFail($data['product_id']);
        $variant = null;

        if (! empty($data['variant_id'])) {
            $variant = $product->variants()->findOrFail($data['variant_id']);
        } elseif ($product->variants()->exists()) {
            return back()->with('error', 'Choose a specific color/size variant.');
        }

        if ($data['mode'] === 'set' && $data['quantity'] < 0) {
            return back()->with('error', 'Stock cannot be negative.');
        }

        $reason = ($data['reason'] ?? null) ?: 'Manual adjustment';
        $userId = $request->user()?->id;

        $change = $data['mode'] === 'set'
            ? StockService::set($product, $variant, $data['quantity'], 'adjustment', $reason, null, $userId)
            : StockService::adjust($product, $variant, $data['quantity'], 'adjustment', $reason, null, $userId);

        return back()->with(
            'success',
            $change === 0 ? 'Stock unchanged.' : 'Stock updated ('.($change > 0 ? '+' : '').$change.').',
        );
    }

    public function history(Request $request): Response
    {
        $type = $request->string('type')->toString();
        $productId = $request->integer('product') ?: null;

        $movements = StockMovement::query()
            ->with('user:id,name')
            ->when($productId, fn ($q) => $q->where('product_id', $productId))
            ->when(
                in_array($type, ['adjustment', 'order', 'cancel', 'product_edit', 'import', 'initial'], true),
                fn ($q) => $q->where('type', $type),
            )
            ->latest('id')
            ->paginate(30)
            ->withQueryString();

        $movements->getCollection()->transform(fn (StockMovement $m) => [
            'id' => $m->id,
            'product_id' => $m->product_id,
            'product_name' => $m->product_name,
            'variant_label' => $m->variant_label,
            'type' => $m->type,
            'change' => $m->change,
            'stock_after' => $m->stock_after,
            'reason' => $m->reason,
            'order_id' => $m->order_id,
            'user' => $m->user?->name,
            'created_at' => $m->created_at?->toIso8601String(),
        ]);

        return Inertia::render('admin/inventory/history', [
            'movements' => $movements,
            'filters' => ['type' => $type ?: 'all', 'product' => $productId],
        ]);
    }

    /**
     * @return array{in: int, low: int, out: int}
     */
    public static function summary(): array
    {
        $threshold = StockService::threshold();

        $count = fn (Closure $stock) => Product::query()
            ->whereDoesntHave('variants')
            ->where($stock)
            ->count() + ProductVariant::query()->where($stock)->count();

        return [
            'out' => $count(fn ($q) => $q->where('stock', '<=', 0)),
            'low' => $count(fn ($q) => $q->where('stock', '>', 0)->where('stock', '<=', $threshold)),
            'in' => $count(fn ($q) => $q->where('stock', '>', $threshold)),
        ];
    }

    /**
     * Rows needing attention (variant rows for variant products, product rows otherwise).
     *
     * @return list<array<string, mixed>>
     */
    public static function lowStockItems(int $limit = 8): array
    {
        $threshold = StockService::threshold();

        $plain = Product::query()
            ->whereDoesntHave('variants')
            ->where('stock', '<=', $threshold)
            ->orderBy('stock')
            ->limit($limit)
            ->get()
            ->map(fn (Product $p) => [
                'product_id' => $p->id,
                'name' => $p->name,
                'variant' => null,
                'stock' => (int) $p->stock,
            ]);

        $variants = ProductVariant::query()
            ->with(['product:id,name', 'color', 'size'])
            ->where('stock', '<=', $threshold)
            ->orderBy('stock')
            ->limit($limit)
            ->get()
            ->map(fn (ProductVariant $v) => [
                'product_id' => $v->product_id,
                'name' => $v->product?->name ?? 'Product',
                'variant' => StockService::variantLabel($v),
                'stock' => (int) $v->stock,
            ]);

        return $plain->concat($variants)->sortBy('stock')->take($limit)->values()->all();
    }

    /** Match products without variants by product stock, with variants by any variant. */
    private function matchStock(Closure $condition): Closure
    {
        return function ($q) use ($condition) {
            $q->where(function ($plain) use ($condition) {
                $plain->whereDoesntHave('variants')->where($condition);
            })->orWhereHas('variants', $condition);
        };
    }
}
