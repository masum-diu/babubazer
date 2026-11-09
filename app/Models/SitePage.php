<?php

namespace App\Models;

use App\Support\SiteDefaults;
use Illuminate\Database\Eloquent\Model;

class SitePage extends Model
{
    protected $fillable = [
        'slug',
        'title',
        'content',
    ];

    protected function casts(): array
    {
        return [
            'content' => 'array',
        ];
    }

    public static function content(string $slug): array
    {
        $defaults = SiteDefaults::for($slug);
        $page = static::query()->where('slug', $slug)->first();

        if (! $page) {
            return $defaults;
        }

        return array_replace($defaults, array_filter(
            $page->content ?? [],
            fn ($value) => $value !== null && $value !== '',
        ));
    }

    public static function ensureDefaults(): void
    {
        foreach (SiteDefaults::all() as $slug => $meta) {
            static::query()->firstOrCreate(
                ['slug' => $slug],
                [
                    'title' => $meta['title'],
                    'content' => $meta['content'],
                ],
            );
        }
    }
}
