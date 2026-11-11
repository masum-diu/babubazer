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

        $content = $page->content ?? [];

        if ($slug === 'home' && ! array_key_exists('banner_slides', $content)) {
            $content['banner_slides'] = [[
                'brand' => $content['hero_brand'] ?? $defaults['hero_brand'],
                'title' => $content['hero_title'] ?? $defaults['hero_title'],
                'text' => $content['hero_text'] ?? $defaults['hero_text'],
                'image' => $content['hero_image'] ?? $defaults['hero_image'],
                'primary' => $content['hero_cta_primary'] ?? $defaults['hero_cta_primary'],
                'primary_url' => $content['hero_cta_primary_url'] ?? $defaults['hero_cta_primary_url'],
                'secondary' => $content['hero_cta_secondary'] ?? $defaults['hero_cta_secondary'],
                'secondary_url' => $content['hero_cta_secondary_url'] ?? $defaults['hero_cta_secondary_url'],
            ]];
        }

        return array_replace($defaults, array_filter(
            $content,
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
