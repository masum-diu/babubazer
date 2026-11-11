<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Support\ImageUpload;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class MediaController extends Controller
{
    public function index(): Response
    {
        $disk = Storage::disk('public');
        $media = collect($disk->allFiles('media'))
            ->filter(fn (string $path) => in_array(
                strtolower(pathinfo($path, PATHINFO_EXTENSION)),
                ['jpg', 'jpeg', 'png', 'webp'],
                true,
            ))
            ->map(fn (string $path) => [
                'name' => basename($path),
                'url' => url('/storage/'.$path),
                'size' => $disk->size($path),
                'updated_at' => $disk->lastModified($path),
            ])
            ->sortByDesc('updated_at')
            ->values();

        return Inertia::render('admin/media/index', [
            'media' => $media,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'images' => ['required', 'array', 'min:1', 'max:20'],
            'images.*' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        foreach ($data['images'] as $image) {
            ImageUpload::store($image, 'media');
        }

        return back()->with('success', count($data['images']).' image(s) uploaded.');
    }
}
