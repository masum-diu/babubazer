<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Bag and checkout are open to signed-in customers and to visitors who chose
 * "Continue as guest" on the login page. Everyone else is sent to the login
 * page and brought back afterwards.
 */
class EnsureCustomerLoggedIn
{
    public const GUEST_SESSION_KEY = 'guest_checkout';

    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() || $request->session()->get(self::GUEST_SESSION_KEY)) {
            return $next($request);
        }

        return redirect()->guest(route('login'))
            ->with('info', 'Please log in, create an account or continue as guest to add items to your bag and place orders.');
    }
}
