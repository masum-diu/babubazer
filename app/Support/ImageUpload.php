<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageUpload
{
    public static function store(UploadedFile $file, string $folder): string
    {
        $path = $file->store($folder, 'public');

        return url('/storage/'.$path);
    }

    public static function delete(?string $url): void
    {
        if (! $url) {
            return;
        }

        $path = self::relativePath($url);

        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }

    public static function relativePath(string $url): ?string
    {
        $path = parse_url($url, PHP_URL_PATH) ?: $url;

        if (! Str::contains($path, '/storage/')) {
            return null;
        }

        return ltrim(Str::after($path, '/storage/'), '/');
    }
}
