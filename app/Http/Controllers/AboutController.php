<?php

namespace App\Http\Controllers;

use App\Models\SitePage;
use Inertia\Inertia;
use Inertia\Response;

class AboutController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('about', [
            'content' => SitePage::content('about'),
        ]);
    }
}
