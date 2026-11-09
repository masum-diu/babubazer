<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    public function orders(Request $request): Response
    {
        return Inertia::render('account/orders', [
            'orders' => $request->user()
                ->orders()
                ->latest()
                ->paginate(10),
        ]);
    }
}
