<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class BulkProductController extends Controller
{
    private const REQUIRED_HEADERS = ['name', 'category', 'price'];

    private const OPTIONAL_HEADERS = [
        'description',
        'brand',
        'age_range',
        'stock',
        'compare_at_price',
        'image_url',
        'is_featured',
        'is_active',
        'product_key',
        'color',
        'color_hex',
        'size',
        'variant_stock',
        'color_image_url',
    ];

    public function index(Request $request): Response
    {
        return Inertia::render('admin/products/bulk-upload', [
            'categories' => Category::query()
                ->orderBy('name')
                ->get(['id', 'name', 'slug']),
            'preview' => $request->session()->get('csvPreview'),
        ]);
    }

    public function template(): StreamedResponse
    {
        $headers = [...self::REQUIRED_HEADERS, ...self::OPTIONAL_HEADERS];
        $category = Category::query()->value('slug') ?? '';
        $samples = [
            ['Soft Baby Blanket', $category, '850', 'Soft cotton blanket', 'BabuBazer', '0-12 months', '', '1000', '', 'false', 'true', 'blanket', 'Cream', '#f5e6c8', 'Small', '8', ''],
            ['Soft Baby Blanket', $category, '850', 'Soft cotton blanket', 'BabuBazer', '0-12 months', '', '1000', '', 'false', 'true', 'blanket', 'Cream', '#f5e6c8', 'Large', '6', ''],
            ['Soft Baby Blanket', $category, '850', 'Soft cotton blanket', 'BabuBazer', '0-12 months', '', '1000', '', 'false', 'true', 'blanket', 'Blue', '#7db5e8', 'Small', '5', ''],
            ['Soft Baby Blanket', $category, '850', 'Soft cotton blanket', 'BabuBazer', '0-12 months', '', '1000', '', 'false', 'true', 'blanket', 'Blue', '#7db5e8', 'Large', '4', ''],
        ];

        return response()->streamDownload(function () use ($headers, $samples): void {
            $output = fopen('php://output', 'wb');
            fputcsv($output, $headers);
            foreach ($samples as $sample) {
                fputcsv($output, $sample);
            }
            fclose($output);
        }, 'babubazer-products-template.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    public function upload(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'action' => ['required', 'in:preview,import'],
        ]);

        if ($validated['action'] === 'preview') {
            $file = $request->validate([
                'csv_file' => ['required', 'file', 'mimes:csv,txt', 'max:5120'],
            ])['csv_file'];
            [$rows, $fileErrors] = $this->parse($file->getRealPath());
            $preview = [
                'rows' => $rows,
                'errors' => $fileErrors,
                'products_count' => count(array_unique(array_column($rows, 'group_key'))),
                'can_import' => $rows !== []
                    && $fileErrors === []
                    && collect($rows)->every(fn (array $row) => $row['errors'] === []),
            ];
            $request->session()->put('csvImportPreview', $preview);

            return redirect()->route('admin.products.import')->with('csvPreview', $preview);
        }

        $preview = $request->session()->get('csvImportPreview');
        if (! is_array($preview)) {
            return redirect()->route('admin.products.import')
                ->with('error', 'Upload and preview a CSV file before importing.');
        }

        if (! $preview['can_import']) {
            return redirect()->route('admin.products.import')
                ->with('csvPreview', $preview)
                ->with('error', 'Fix the CSV errors before importing products.');
        }

        $rows = $preview['rows'];

        $products = collect($rows)->groupBy('group_key');

        DB::transaction(function () use ($products): void {
            foreach ($products as $productRows) {
                $row = $productRows->first();
                $base = Str::slug($row['name']) ?: 'product';
                $slug = $base;
                $suffix = 1;

                while (Product::query()->where('slug', $slug)->exists()) {
                    $slug = $base.'-'.$suffix++;
                }

                $hasVariants = $productRows->contains(
                    fn (array $variantRow) => $variantRow['color'] !== ''
                        || $variantRow['size'] !== '',
                );
                $productStock = $hasVariants
                    ? (int) $productRows->sum('stock')
                    : (int) $row['stock'];
                $firstColorImage = $productRows->first(
                    fn (array $variantRow) => $variantRow['color_image_url'] !== '',
                )['color_image_url'] ?? null;
                $mainImage = $row['image_url'] ?: $firstColorImage;

                $product = Product::create([
                    'category_id' => $row['category_id'],
                    'name' => $row['name'],
                    'slug' => $slug,
                    'description' => $row['description'] ?: null,
                    'brand' => $row['brand'] ?: null,
                    'age_range' => $row['age_range'] ?: null,
                    'price' => $row['price'],
                    'compare_at_price' => $row['compare_at_price'] ?: null,
                    'stock' => $productStock,
                    'image' => $mainImage,
                    'gallery' => $mainImage ? [$mainImage] : null,
                    'is_featured' => $row['is_featured'],
                    'is_active' => $row['is_active'],
                ]);

                $colors = [];
                $sizes = [];
                $combinations = [];

                foreach ($productRows as $variantRow) {
                    $color = null;
                    if ($variantRow['color'] !== '') {
                        $colorKey = Str::lower($variantRow['color']);
                        $color = $colors[$colorKey] ??= $product->colors()->create([
                            'name' => $variantRow['color'],
                            'hex' => $variantRow['color_hex'] ?: '#cccccc',
                        ]);
                    }

                    $size = null;
                    if ($variantRow['size'] !== '') {
                        $sizeKey = Str::lower($variantRow['size']);
                        $size = $sizes[$sizeKey] ??= $product->sizes()->create([
                            'name' => $variantRow['size'],
                        ]);
                    }

                    if (! $color && ! $size) {
                        continue;
                    }

                    $combinationKey = ($color?->id ?? 'none').'|'.($size?->id ?? 'none');
                    if (isset($combinations[$combinationKey])) {
                        throw new \LogicException('Duplicate product variant passed CSV validation.');
                    }
                    $combinations[$combinationKey] = true;

                    $product->variants()->create([
                        'product_color_id' => $color?->id,
                        'product_size_id' => $size?->id,
                        'stock' => $variantRow['stock'],
                    ]);

                    if ($color && $variantRow['color_image_url'] !== '') {
                        $color->images()->firstOrCreate(
                            ['path' => $variantRow['color_image_url']],
                            ['sort_order' => $color->images()->count()],
                        );
                    }
                }
            }
        });

        $request->session()->forget('csvImportPreview');

        return redirect()->route('admin.products.index')
            ->with('success', $products->count().' products imported successfully.');
    }

    /**
     * @return array{0: array<int, array<string, mixed>>, 1: array<int, string>}
     */
    private function parse(string $path): array
    {
        $stream = fopen($path, 'rb');
        if ($stream === false) {
            return [[], ['Unable to read the uploaded CSV file.']];
        }

        $headers = fgetcsv($stream, null, ',', '"', '\\');
        if ($headers === false) {
            fclose($stream);

            return [[], ['The CSV file is empty.']];
        }

        $headers[0] = preg_replace('/^\xEF\xBB\xBF/', '', (string) $headers[0]);
        $headers = array_map(fn ($header) => strtolower(trim((string) $header)), $headers);
        $missing = array_values(array_diff(self::REQUIRED_HEADERS, $headers));
        if ($missing !== []) {
            fclose($stream);

            return [[], ['Missing required columns: '.implode(', ', $missing).'.']];
        }

        $unknown = array_values(array_diff(
            $headers,
            [...self::REQUIRED_HEADERS, ...self::OPTIONAL_HEADERS],
        ));
        if ($unknown !== []) {
            fclose($stream);

            return [[], ['Unknown columns: '.implode(', ', $unknown).'.']];
        }

        if (count($headers) !== count(array_unique($headers))) {
            fclose($stream);

            return [[], ['CSV column names must not be duplicated.']];
        }

        $rows = [];
        $fileErrors = [];
        $line = 1;

        while (($values = fgetcsv($stream, null, ',', '"', '\\')) !== false) {
            $line++;
            if ($values === [null] || $values === []) {
                continue;
            }
            if (count($rows) >= 500) {
                $fileErrors[] = 'A maximum of 500 products can be imported at once.';
                break;
            }

            $hasExtraValues = count($values) > count($headers);
            $record = array_combine(
                $headers,
                array_pad(array_slice($values, 0, count($headers)), count($headers), ''),
            );
            $record = array_map(
                fn ($value) => is_string($value) ? trim($value) : '',
                $record,
            );
            $category = Category::query()
                ->where('slug', $record['category'])
                ->orWhereRaw('LOWER(name) = ?', [Str::lower($record['category'])])
                ->first();

            $input = [
                'name' => $record['name'],
                'category_id' => $category?->id,
                'price' => $record['price'],
                'stock' => $record['stock'] ?? '',
                'variant_stock' => $record['variant_stock'] ?? '',
                'description' => $record['description'] ?? '',
                'brand' => $record['brand'] ?? '',
                'age_range' => $record['age_range'] ?? '',
                'compare_at_price' => ($record['compare_at_price'] ?? '') !== ''
                    ? $record['compare_at_price']
                    : null,
                'image_url' => $record['image_url'] ?? '',
                'is_featured' => strtolower(($record['is_featured'] ?? '') ?: 'false'),
                'is_active' => strtolower(($record['is_active'] ?? '') ?: 'true'),
                'product_key' => $record['product_key'] ?? '',
                'color' => $record['color'] ?? '',
                'color_hex' => $record['color_hex'] ?? '',
                'size' => $record['size'] ?? '',
                'color_image_url' => $record['color_image_url'] ?? '',
            ];
            $hasVariant = $input['color'] !== '' || $input['size'] !== '';
            $stock = $input['variant_stock'] !== '' ? $input['variant_stock'] : $input['stock'];
            $rules = [
                'name' => ['required', 'string', 'max:180'],
                'category_id' => ['required', 'exists:categories,id'],
                'price' => ['required', 'numeric', 'min:0'],
                'stock' => [$hasVariant ? 'nullable' : 'required', 'integer', 'min:0'],
                'variant_stock' => ['nullable', 'integer', 'min:0'],
                'description' => ['nullable', 'string', 'max:10000'],
                'brand' => ['nullable', 'string', 'max:100'],
                'age_range' => ['nullable', 'string', 'max:50'],
                'compare_at_price' => ['nullable', 'numeric', 'min:0'],
                'image_url' => [
                    'nullable',
                    'url',
                    'max:2048',
                ],
                'color' => ['nullable', 'string', 'max:100'],
                'color_hex' => ['nullable', 'regex:/^#?(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/'],
                'size' => ['nullable', 'string', 'max:100'],
                'color_image_url' => ['nullable', 'url', 'max:2048'],
                'is_featured' => ['required', 'in:true,false,1,0,yes,no'],
                'is_active' => ['required', 'in:true,false,1,0,yes,no'],
            ];
            $validator = Validator::make($input, $rules);
            $errors = $validator->errors()->all();
            if ($hasVariant && $stock === '') {
                $errors[] = 'Enter stock or variant_stock for this color/size combination.';
            }
            if (! $hasVariant && $input['variant_stock'] !== '') {
                $errors[] = 'Set color or size when using variant_stock.';
            }
            if ($input['color'] === '' && ($input['color_hex'] !== '' || $input['color_image_url'] !== '')) {
                $errors[] = 'Color hex and color image require a color value.';
            }
            if ($hasExtraValues) {
                $errors[] = 'This row has more values than the CSV header.';
            }

            $rows[] = [
                'line' => $line,
                'group_key' => $input['product_key'] !== ''
                    ? 'key:'.Str::lower($input['product_key'])
                    : 'product:'.($category?->id ?? 'unknown').':'.Str::slug($input['name']),
                'name' => $input['name'],
                'category' => $category?->name ?? $record['category'],
                'category_id' => $category?->id,
                'price' => $input['price'],
                'stock' => $stock,
                'image_url' => $input['image_url'],
                'description' => $input['description'],
                'brand' => $input['brand'],
                'age_range' => $input['age_range'],
                'compare_at_price' => $input['compare_at_price'],
                'is_featured' => $this->toBoolean($input['is_featured']),
                'is_active' => $this->toBoolean($input['is_active']),
                'product_key' => $input['product_key'],
                'color' => $input['color'],
                'color_hex' => $input['color_hex'] ? '#'.ltrim($input['color_hex'], '#') : '',
                'size' => $input['size'],
                'color_image_url' => $input['color_image_url'],
                'errors' => $errors,
            ];
        }

        $groups = [];
        foreach ($rows as $index => $row) {
            $groupKey = $row['group_key'];
            $combination = Str::lower($row['color']).'|'.Str::lower($row['size']);

            if (! isset($groups[$groupKey])) {
                $groups[$groupKey] = [
                    'first' => $row,
                    'combinations' => [],
                    'has_plain_row' => false,
                    'has_variant_row' => false,
                ];
            } else {
                foreach ([
                    'name', 'category_id', 'price', 'description', 'brand',
                    'age_range', 'compare_at_price', 'image_url', 'is_featured', 'is_active',
                ] as $field) {
                    if ($groups[$groupKey]['first'][$field] !== $row[$field]) {
                        $rows[$index]['errors'][] = "Product details must match across rows with the same product key ({$field}).";
                    }
                }
            }

            if ($row['color'] !== '' || $row['size'] !== '') {
                if ($groups[$groupKey]['has_plain_row']) {
                    $rows[$index]['errors'][] = 'Do not mix plain product rows with variant rows for the same product.';
                }
                $groups[$groupKey]['has_variant_row'] = true;
                if (isset($groups[$groupKey]['combinations'][$combination])) {
                    $rows[$index]['errors'][] = 'This color/size combination is listed more than once for the product.';
                }
                $groups[$groupKey]['combinations'][$combination] = true;
            } else {
                if ($groups[$groupKey]['has_variant_row'] || $groups[$groupKey]['has_plain_row']) {
                    $rows[$index]['errors'][] = 'A product without variants must have only one CSV row and cannot share its product key.';
                }
                $groups[$groupKey]['has_plain_row'] = true;
            }
        }

        fclose($stream);

        return [$rows, $fileErrors];
    }

    private function toBoolean(string $value): bool
    {
        return in_array(strtolower($value), ['true', '1', 'yes'], true);
    }
}
