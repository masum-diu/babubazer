<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AttributeColor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AttributeColorController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/colors/index', [
            'colors' => AttributeColor::query()
                ->orderByDesc('sort_order')
                ->orderByDesc('id')
                ->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);
        $data['sort_order'] = $this->nextSortOrder();

        AttributeColor::create($data);

        return back()->with('success', 'Color created');
    }

    public function update(Request $request, AttributeColor $color): RedirectResponse
    {
        $color->update($this->validated($request));

        return back()->with('success', 'Color updated');
    }

    public function destroy(AttributeColor $color): RedirectResponse
    {
        $color->delete();

        return back()->with('success', 'Color removed');
    }

    /** @return array{name:string,hex:string,is_active:bool} */
    protected function validated(Request $request): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:80'],
            'hex' => ['required', 'string', 'max:20'],
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
        return ((int) AttributeColor::query()->max('sort_order')) + 1;
    }
}
