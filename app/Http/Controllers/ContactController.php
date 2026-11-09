<?php

namespace App\Http\Controllers;

use App\Models\SitePage;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('contact', [
            'content' => SitePage::content('contact'),
        ]);
    }
}
