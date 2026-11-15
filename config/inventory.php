<?php

return [
    // Items with stock at or below this number are flagged as "low stock".
    'low_stock_threshold' => (int) env('INVENTORY_LOW_STOCK', 5),
];
