<?php

namespace App\Http\Controllers;

use App\Models\SitePage;
use App\Support\PageMeta;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    public function __invoke(): Response
    {
        $content = SitePage::content('contact');

        return Inertia::render('contact', [
            'content' => $content,
            'meta' => PageMeta::make($content['hero_text'] ?? null, $content['side_image'] ?? null, title: 'Contact Us'),
        ]);
    }
}
