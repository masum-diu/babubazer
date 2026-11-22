<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        @php
            $props = $page['props'] ?? [];
            $meta = $props['meta'] ?? [];
            $siteName = $props['navbar']['brand_name'] ?? config('app.name', 'Laravel');
            $description = $meta['description']
                ?? ($props['footer']['blurb'] ?? 'Soft, safe and trusted baby care products delivered to your door.');
            $image = $meta['image'] ?? ($props['navbar']['logo'] ?? null);
            $image = $image ? (str_starts_with($image, 'http') ? $image : url($image)) : null;
            $ogTitle = ! empty($meta['title']) ? $meta['title'].' - '.$siteName : $siteName;
            $private = request()->is('admin*', 'cart*', 'checkout*', 'account*', 'orders*', 'login', 'register');
        @endphp
        <meta name="description" content="{{ $description }}">
        <meta name="theme-color" content="#1f8a70">
        <meta name="robots" content="{{ $private ? 'noindex, nofollow' : 'index, follow' }}">
        <link rel="canonical" href="{{ url()->current() }}">

        <meta property="og:site_name" content="{{ $siteName }}">
        <meta property="og:type" content="{{ $meta['type'] ?? 'website' }}">
        <meta property="og:title" content="{{ $ogTitle }}">
        <meta property="og:description" content="{{ $description }}">
        <meta property="og:url" content="{{ url()->current() }}">
        <meta property="og:locale" content="en_US">
        @if ($image)
            <meta property="og:image" content="{{ $image }}">
        @endif
        @if (! empty($meta['price']))
            <meta property="product:price:amount" content="{{ $meta['price'] }}">
            <meta property="product:price:currency" content="BDT">
        @endif
        <meta name="twitter:card" content="{{ $image ? 'summary_large_image' : 'summary' }}">
        <meta name="twitter:title" content="{{ $ogTitle }}">
        <meta name="twitter:description" content="{{ $description }}">
        @if ($image)
            <meta name="twitter:image" content="{{ $image }}">
        @endif

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png">
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
        <meta name="theme-color" content="#FF9D16">

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ config('app.name', 'Laravel') }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
