<?php

namespace App\Support;

use App\Models\Product;
use App\Models\ProductColor;
use App\Models\ProductColorImage;
use App\Models\ProductSize;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductVariantSync
{
    public static function sync(Product $product, Request $request): void
    {
        $colorsInput = self::decode($request->input('colors_json', '[]'));
        $sizesInput = self::decode($request->input('sizes_json', '[]'));
        $stocksInput = self::decode($request->input('stocks_json', '[]'));

        DB::transaction(function () use ($product, $request, $colorsInput, $sizesInput, $stocksInput) {
            $keepColorIds = [];
            $colorMap = []; // temp key => model

            foreach (array_values($colorsInput) as $index => $colorData) {
                $name = trim((string) ($colorData['name'] ?? ''));
                if ($name === '') {
                    continue;
                }

                $tempKey = (string) ($colorData['key'] ?? 'color_'.$index);
                $colorId = $colorData['id'] ?? null;

                $color = $colorId
                    ? ProductColor::query()->where('product_id', $product->id)->find($colorId)
                    : null;

                if (! $color) {
                    $color = new ProductColor(['product_id' => $product->id]);
                }

                $color->fill([
                    'name' => $name,
                    'hex' => $colorData['hex'] ?? '#cccccc',
                    'sort_order' => $index,
                ]);
                $color->save();

                $keepColorIds[] = $color->id;
                $colorMap[$tempKey] = $color;

                $keepImageIds = [];
                foreach (($colorData['existing_images'] ?? []) as $imageSort => $image) {
                    if (! empty($image['id'])) {
                        $keepImageIds[] = (int) $image['id'];
                        ProductColorImage::query()
                            ->where('product_color_id', $color->id)
                            ->whereKey($image['id'])
                            ->update(['sort_order' => $imageSort]);
                    }
                }

                $uploadKey = "color_images_{$tempKey}";
                if ($request->hasFile($uploadKey)) {
                    $files = $request->file($uploadKey);
                    if (! is_array($files)) {
                        $files = [$files];
                    }

                    foreach ($files as $fileSort => $file) {
                        if (! $file) {
                            continue;
                        }

                        $path = ImageUpload::store($file, 'products/colors');
                        $image = ProductColorImage::create([
                            'product_color_id' => $color->id,
                            'path' => $path,
                            'sort_order' => 1000 + (int) $fileSort,
                        ]);
                        $keepImageIds[] = $image->id;
                    }
                }

                $color->images()
                    ->whereNotIn('id', $keepImageIds ?: [0])
                    ->get()
                    ->each(function (ProductColorImage $image) {
                        ImageUpload::delete($image->path);
                        $image->delete();
                    });

                // If product main image empty, use first color image.
                if (! $product->image) {
                    $first = $color->images()->orderBy('sort_order')->first();
                    if ($first) {
                        $product->update(['image' => $first->path]);
                    }
                }
            }

            // Delete removed colors
            $product->colors()
                ->whereNotIn('id', $keepColorIds ?: [0])
                ->get()
                ->each(function (ProductColor $color) {
                    $color->images->each(function (ProductColorImage $image) {
                        ImageUpload::delete($image->path);
                    });
                    $color->delete();
                });

            $keepSizeIds = [];
            $sizeMap = [];

            foreach (array_values($sizesInput) as $index => $sizeData) {
                $name = trim((string) ($sizeData['name'] ?? ''));
                if ($name === '') {
                    continue;
                }

                $tempKey = (string) ($sizeData['key'] ?? 'size_'.$index);
                $sizeId = $sizeData['id'] ?? null;

                $size = $sizeId
                    ? ProductSize::query()->where('product_id', $product->id)->find($sizeId)
                    : null;

                if (! $size) {
                    $size = new ProductSize(['product_id' => $product->id]);
                }

                $size->fill([
                    'name' => $name,
                    'sort_order' => $index,
                ]);
                $size->save();

                $keepSizeIds[] = $size->id;
                $sizeMap[$tempKey] = $size;
            }

            $product->sizes()
                ->whereNotIn('id', $keepSizeIds ?: [0])
                ->delete();

            // Rebuild variants
            $product->variants()->delete();

            $colors = $product->colors()->get();
            $sizes = $product->sizes()->get();

            if ($colors->isEmpty() && $sizes->isEmpty()) {
                $product->syncStockFromVariants();

                return;
            }

            $stockLookup = [];
            foreach ($stocksInput as $row) {
                $ck = (string) ($row['color_key'] ?? '');
                $sk = (string) ($row['size_key'] ?? '');
                $stockLookup[$ck.'|'.$sk] = max(0, (int) ($row['stock'] ?? 0));
            }

            if ($colors->isNotEmpty() && $sizes->isNotEmpty()) {
                foreach ($colorMap as $colorKey => $color) {
                    foreach ($sizeMap as $sizeKey => $size) {
                        ProductVariant::create([
                            'product_id' => $product->id,
                            'product_color_id' => $color->id,
                            'product_size_id' => $size->id,
                            'stock' => $stockLookup[$colorKey.'|'.$sizeKey] ?? 0,
                        ]);
                    }
                }
            } elseif ($colors->isNotEmpty()) {
                foreach ($colorMap as $colorKey => $color) {
                    ProductVariant::create([
                        'product_id' => $product->id,
                        'product_color_id' => $color->id,
                        'product_size_id' => null,
                        'stock' => $stockLookup[$colorKey.'|'] ?? 0,
                    ]);
                }
            } else {
                foreach ($sizeMap as $sizeKey => $size) {
                    ProductVariant::create([
                        'product_id' => $product->id,
                        'product_color_id' => null,
                        'product_size_id' => $size->id,
                        'stock' => $stockLookup['|'.$sizeKey] ?? 0,
                    ]);
                }
            }

            $product->syncStockFromVariants();
        });
    }

    /** @return array<int, mixed> */
    protected static function decode(mixed $value): array
    {
        if (is_array($value)) {
            return $value;
        }

        if (! is_string($value) || $value === '') {
            return [];
        }

        $decoded = json_decode($value, true);

        return is_array($decoded) ? $decoded : [];
    }
}
