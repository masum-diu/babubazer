<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'description',
        'brand',
        'age_range',
        'price',
        'compare_at_price',
        'stock',
        'image',
        'gallery',
        'is_featured',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'compare_at_price' => 'decimal:2',
            'stock' => 'integer',
            'gallery' => 'array',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    public function colors(): HasMany
    {
        return $this->hasMany(ProductColor::class)->orderBy('sort_order')->orderBy('id');
    }

    public function sizes(): HasMany
    {
        return $this->hasMany(ProductSize::class)->orderBy('sort_order')->orderBy('id');
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function hasVariants(): bool
    {
        return $this->colors()->exists() || $this->sizes()->exists();
    }

    public function availableStock(?int $colorId = null, ?int $sizeId = null): int
    {
        if (! $this->relationLoaded('variants') && ! $this->variants()->exists()) {
            return (int) $this->stock;
        }

        $query = $this->variants();

        if ($colorId) {
            $query->where('product_color_id', $colorId);
        }

        if ($sizeId) {
            $query->where('product_size_id', $sizeId);
        }

        if ($this->variants()->exists()) {
            return (int) $query->sum('stock');
        }

        return (int) $this->stock;
    }

    public function findVariant(?int $colorId, ?int $sizeId): ?ProductVariant
    {
        return $this->variants()
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
    }

    public function syncStockFromVariants(): void
    {
        if (! $this->variants()->exists()) {
            return;
        }

        $this->update([
            'stock' => (int) $this->variants()->sum('stock'),
        ]);
    }

    public function getEffectivePriceAttribute(): float
    {
        return (float) $this->price;
    }

    public function getIsOnSaleAttribute(): bool
    {
        return $this->compare_at_price !== null
            && (float) $this->compare_at_price > (float) $this->price;
    }
}
