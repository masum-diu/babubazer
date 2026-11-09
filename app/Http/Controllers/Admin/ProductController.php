<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AttributeColor;
use App\Models\AttributeSize;
use App\Models\Category;
use App\Models\Product;
use App\Support\ImageUpload;
use App\Support\ProductVariantSync;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/products/index', [
            'products' => Product::query()
                ->with('category:id,name')
                ->latest()
                ->paginate(15),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/products/form', [
            'product' => null,
            'categories' => $this->categoryOptions(),
            'attributeColors' => $this->attributeColors(),
            'attributeSizes' => $this->attributeSizes(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);
        $data['slug'] = $this->uniqueSlug($data['name']);

        if ($request->hasFile('image')) {
            $data['image'] = ImageUpload::store($request->file('image'), 'products');
            $data['gallery'] = [$data['image']];
        } else {
            unset($data['image']);
        }

        $product = Product::create($data);
        ProductVariantSync::sync($product, $request);

        return redirect()->route('admin.products.index')->with('success', 'Product created');
    }

    public function edit(Product $product): Response
    {
        $product->load([
            'colors.images',
            'sizes',
            'variants',
        ]);

        return Inertia::render('admin/products/form', [
            'product' => $product,
            'categories' => $this->categoryOptions(),
            'attributeColors' => $this->attributeColors(),
            'attributeSizes' => $this->attributeSizes(),
        ]);
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        $data = $this->validated($request);

        if ($product->name !== $data['name']) {
            $data['slug'] = $this->uniqueSlug($data['name'], $product->id);
        }

        if ($request->hasFile('image')) {
            ImageUpload::delete($product->image);
            $data['image'] = ImageUpload::store($request->file('image'), 'products');
            $data['gallery'] = [$data['image']];
        } else {
            unset($data['image']);
        }

        $product->update($data);
        ProductVariantSync::sync($product->fresh(), $request);

        return redirect()->route('admin.products.index')->with('success', 'Product updated');
    }

    public function destroy(Product $product): RedirectResponse
    {
        ImageUpload::delete($product->image);
        $product->delete();

        return back()->with('success', 'Product deleted');
    }

    protected function validated(Request $request): array
    {
        $data = $request->validate([
            'category_id' => ['required', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:180'],
            'description' => ['nullable', 'string'],
            'brand' => ['nullable', 'string', 'max:100'],
            'age_range' => ['nullable', 'string', 'max:50'],
            'price' => ['required', 'numeric', 'min:0'],
            'compare_at_price' => ['nullable', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:1024'],
            'is_featured' => ['sometimes', 'boolean'],
            'is_active' => ['sometimes', 'boolean'],
            'colors_json' => ['nullable', 'string'],
            'sizes_json' => ['nullable', 'string'],
            'stocks_json' => ['nullable', 'string'],
        ]);

        if (($data['compare_at_price'] ?? null) === '' || ($data['compare_at_price'] ?? null) === null) {
            $data['compare_at_price'] = null;
        }

        $data['is_featured'] = filter_var(
            $data['is_featured'] ?? false,
            FILTER_VALIDATE_BOOLEAN,
        );
        $data['is_active'] = filter_var(
            $data['is_active'] ?? true,
            FILTER_VALIDATE_BOOLEAN,
        );

        unset($data['colors_json'], $data['sizes_json'], $data['stocks_json']);

        return $data;
    }

    protected function uniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name) ?: 'product';
        $slug = $base;
        $i = 1;

        while (
            Product::query()
                ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
                ->where('slug', $slug)
                ->exists()
        ) {
            $slug = $base.'-'.$i++;
        }

        return $slug;
    }

    /** @return array<int, array{id:int,name:string,hex:string}> */
    protected function attributeColors(): array
    {
        return AttributeColor::query()
            ->where('is_active', true)
            ->orderByDesc('sort_order')
            ->orderByDesc('id')
            ->get(['id', 'name', 'hex'])
            ->all();
    }

    /** @return array<int, array{id:int,name:string}> */
    protected function attributeSizes(): array
    {
        return AttributeSize::query()
            ->where('is_active', true)
            ->orderByDesc('sort_order')
            ->orderByDesc('id')
            ->get(['id', 'name'])
            ->all();
    }

    /** @return array<int, array{id:int,name:string,group:string}> */
    protected function categoryOptions(): array
    {
        $parents = Category::query()
            ->whereNull('parent_id')
            ->with([
                'children' => fn ($q) => $q->orderByDesc('sort_order')->orderByDesc('id'),
            ])
            ->orderByDesc('sort_order')
            ->orderByDesc('id')
            ->get();

        $options = [];

        foreach ($parents as $parent) {
            if ($parent->children->isEmpty()) {
                $options[] = [
                    'id' => $parent->id,
                    'name' => $parent->name,
                    'group' => $parent->name,
                ];
                continue;
            }

            foreach ($parent->children as $child) {
                $options[] = [
                    'id' => $child->id,
                    'name' => $child->name,
                    'group' => $parent->name,
                ];
            }
        }

        return $options;
    }
}
