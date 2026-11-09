<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Support\ImageUpload;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(): Response
    {
        $parents = Category::query()
            ->whereNull('parent_id')
            ->with([
                'children' => fn ($q) => $q->orderByDesc('sort_order')->orderByDesc('id'),
            ])
            ->orderByDesc('sort_order')
            ->orderByDesc('id')
            ->get();

        return Inertia::render('admin/categories/index', [
            'categories' => $parents,
            'parentOptions' => Category::query()
                ->whereNull('parent_id')
                ->orderByDesc('sort_order')
                ->orderByDesc('id')
                ->get(['id', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);
        $data['slug'] = $this->uniqueSlug($data['name']);
        $data['sort_order'] = $this->nextSortOrder($data['parent_id'] ?? null);

        if ($request->hasFile('image')) {
            $data['image'] = ImageUpload::store($request->file('image'), 'categories');
        } else {
            unset($data['image']);
        }

        Category::create($data);

        return back()->with(
            'success',
            ($data['parent_id'] ?? null) ? 'Subcategory created' : 'Category created',
        );
    }

    public function update(Request $request, Category $category): RedirectResponse
    {
        $data = $this->validated($request, $category->id);

        if (($data['parent_id'] ?? null) === $category->id) {
            return back()->with('error', 'A category cannot be its own parent');
        }

        if (
            ($data['parent_id'] ?? null)
            && $category->children()->exists()
        ) {
            return back()->with('error', 'Move or remove subcategories before nesting this category');
        }

        if ($category->name !== $data['name']) {
            $data['slug'] = $this->uniqueSlug($data['name'], $category->id);
        }

        // Keep existing order; only reset if parent changes.
        if (($data['parent_id'] ?? null) !== $category->parent_id) {
            $data['sort_order'] = $this->nextSortOrder($data['parent_id'] ?? null);
        } else {
            unset($data['sort_order']);
        }

        if ($request->hasFile('image')) {
            ImageUpload::delete($category->image);
            $data['image'] = ImageUpload::store($request->file('image'), 'categories');
        } else {
            unset($data['image']);
        }

        $category->update($data);

        return back()->with(
            'success',
            ($data['parent_id'] ?? null) ? 'Subcategory updated' : 'Category updated',
        );
    }

    public function destroy(Category $category): RedirectResponse
    {
        $isSub = $category->parent_id !== null;

        if ($category->children()->exists()) {
            return back()->with('error', 'Delete subcategories first');
        }

        if ($category->products()->exists()) {
            return back()->with(
                'error',
                $isSub
                    ? 'Move or delete products in this subcategory first'
                    : 'Move or delete products in this category first',
            );
        }

        ImageUpload::delete($category->image);
        $category->delete();

        return back()->with(
            'success',
            $isSub ? 'Subcategory deleted' : 'Category deleted',
        );
    }

    protected function validated(Request $request, ?int $ignoreId = null): array
    {
        $data = $request->validate([
            'parent_id' => [
                'nullable',
                Rule::exists('categories', 'id')->where(fn ($q) => $q->whereNull('parent_id')),
                Rule::notIn(array_filter([$ignoreId])),
            ],
            'name' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:1000'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:1024'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $data['parent_id'] = $data['parent_id'] ?? null;
        $data['is_active'] = filter_var(
            $data['is_active'] ?? true,
            FILTER_VALIDATE_BOOLEAN,
        );

        return $data;
    }

    protected function nextSortOrder(?int $parentId): int
    {
        $max = Category::query()
            ->when(
                $parentId === null,
                fn ($q) => $q->whereNull('parent_id'),
                fn ($q) => $q->where('parent_id', $parentId),
            )
            ->max('sort_order');

        return ((int) $max) + 1;
    }

    protected function uniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name) ?: 'category-'.Str::lower(Str::random(6));
        $slug = $base;
        $i = 1;

        while (
            Category::query()
                ->where('slug', $slug)
                ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $slug = $base.'-'.$i++;
        }

        return $slug;
    }
}
