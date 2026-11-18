<?php

namespace App\Support;

use Illuminate\Support\Str;

/**
 * SEO / social-share meta tags, rendered server-side in resources/views/app.blade.php
 * so link previews (WhatsApp, Facebook, Google) work without running JavaScript.
 */
class PageMeta
{
    /**
     * @return array{title: string|null, description: string|null, image: string|null, type: string, price: string|null}
     */
    public static function make(
        ?string $description = null,
        ?string $image = null,
        string $type = 'website',
        float|string|null $price = null,
        ?string $title = null,
    ): array {
        return [
            'title' => $title,
            'description' => $description ? self::clean($description) : null,
            'image' => $image,
            'type' => $type,
            'price' => $price !== null ? number_format((float) $price, 2, '.', '') : null,
        ];
    }

    public static function clean(string $text, int $limit = 160): string
    {
        $text = trim(preg_replace('/\s+/', ' ', strip_tags($text)) ?? '');

        return Str::limit($text, $limit, '…');
    }
}
