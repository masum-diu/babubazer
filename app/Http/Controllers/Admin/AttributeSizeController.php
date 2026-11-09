<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AttributeSize;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AttributeSizeController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/sizes/index', [
            'sizes' => AttributeSize::query()
                ->orderByDesc('sort_order')
                ->orderByDesc('id')
                ->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);
        $data['sort_order'] = $this->nextSortOrder();

        AttributeSize::create($data);

        return back()->with('success', 'Size created');
    }

    public function update(Request $request, AttributeSize $size): RedirectResponse
    {
        $size->update($this->validated($request));

        return back()->with('success', 'Size updated');
    }

    public function destroy(AttributeSize $size): RedirectResponse
    {
        $size->delete();

        return back()->with('success', 'Size removed');
    }

    /** @return array{name:string,is_active:bool} */
    protected function validated(Request $request): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:80'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $data['is_active'] = filter_var(
            $data['is_active'] ?? true,
            FILTER_VALIDATE_BOOLEAN,
        );

        return $data;
    }

    protected function nextSortOrder(): int
    {
        return ((int) AttributeSize::query()->max('sort_order')) + 1;
    }
}
