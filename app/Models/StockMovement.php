<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockMovement extends Model
{
    protected $fillable = [
        'product_id',
        'product_variant_id',
        'product_name',
        'variant_label',
        'type',
        'change',
        'stock_after',
        'reason',
        'order_id',
        'user_id',
    ];

    protected function casts(): array
    {
        return [
            'change' => 'integer',
            'stock_after' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
