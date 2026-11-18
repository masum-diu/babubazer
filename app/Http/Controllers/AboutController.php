<?php

namespace App\Http\Controllers;

use App\Models\SitePage;
use App\Support\PageMeta;
use Inertia\Inertia;
use Inertia\Response;

class AboutController extends Controller
{
    public function __invoke(): Response
    {
        $content = SitePage::content('about');

        return Inertia::render('about', [
            'content' => $content,
            'meta' => PageMeta::make($content['hero_text'] ?? null, $content['hero_image'] ?? null, title: 'About Us'),
        ]);
    }
}
