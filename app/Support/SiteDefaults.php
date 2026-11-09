<?php

namespace App\Support;

class SiteDefaults
{
    public static function all(): array
    {
        return [
            'home' => [
                'title' => 'Home',
                'content' => self::home(),
            ],
            'about' => [
                'title' => 'About',
                'content' => self::about(),
            ],
            'contact' => [
                'title' => 'Contact',
                'content' => self::contact(),
            ],
            'footer' => [
                'title' => 'Footer',
                'content' => self::footer(),
            ],
        ];
    }

    public static function for(string $slug): array
    {
        return self::all()[$slug]['content'] ?? [];
    }

    public static function home(): array
    {
        return [
            'hero_image' => 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=1600&q=80',
            'hero_brand' => 'BabuBazer',
            'hero_title' => 'Big care for little ones — delivered home',
            'hero_text' => 'Care, diapers, feeding, toys and clothing — trusted baby products you can order in one click.',
            'hero_cta_primary' => 'Start shopping',
            'hero_cta_primary_url' => '/shop',
            'hero_cta_secondary' => 'Browse shop',
            'hero_cta_secondary_url' => '/shop',
            'categories_eyebrow' => 'Categories',
            'categories_title' => 'What does your little one need?',
            'featured_eyebrow' => 'Featured',
            'featured_title' => "Today's picks",
            'promises_eyebrow' => 'Why BabuBazer',
            'promises_title' => 'Easy, safe shopping for little ones',
            'promise_1_title' => 'Free delivery over ৳2000',
            'promise_1_text' => 'Shipping free on larger orders',
            'promise_2_title' => 'Cash on delivery',
            'promise_2_text' => 'bKash / Nagad / COD supported',
            'promise_3_title' => 'Safe for baby',
            'promise_3_text' => 'Soft, trusted essentials only',
        ];
    }

    public static function about(): array
    {
        return [
            'hero_image' => 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1600&q=80',
            'hero_brand' => 'BabuBazer',
            'hero_title' => 'Built for parents. Soft on little ones.',
            'hero_text' => 'A calmer way to shop baby clothing and essentials — thoughtful picks, clear details, delivered home.',
            'story_eyebrow' => 'Our story',
            'story_title' => 'Shopping for baby should feel easy.',
            'story_text' => 'We started BabuBazer to remove the noise from baby shopping. Every romper, set, and accessory is picked for comfort first — then style, then a price that makes sense for everyday parents.',
            'story_image' => 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1000&q=80',
            'story_image_caption' => 'Soft fabrics. Real care.',
            'pillar_1_title' => 'Chosen with care',
            'pillar_1_text' => 'Soft fabrics, safe materials, and pieces parents can trust day after day.',
            'pillar_2_title' => 'Clear & fair',
            'pillar_2_text' => 'Honest prices, clear sizes, and product details without the guesswork.',
            'pillar_3_title' => 'Doorstep ready',
            'pillar_3_text' => 'Cash on delivery and quick shipping across Bangladesh.',
            'cta_eyebrow' => 'Ready when you are',
            'cta_title' => 'Explore Man & Women baby collections',
            'cta_text' => 'Soft rompers, sets, shoes and more — sized for growing little ones.',
            'cta_button' => 'Browse shop',
            'cta_button_url' => '/shop',
        ];
    }

    public static function contact(): array
    {
        return [
            'hero_brand' => 'BabuBazer',
            'hero_title' => "Say hello — we're happy to help",
            'hero_text' => 'Questions about sizes, orders, or delivery? Drop a message and we\'ll get back soon.',
            'reach_eyebrow' => 'Reach us',
            'reach_title' => 'Direct lines',
            'address_label' => 'Visit',
            'address' => 'Dhaka, Bangladesh',
            'phone_label' => 'Call',
            'phone' => '+880 1700-000000',
            'email_label' => 'Email',
            'email' => 'hello@babubazer.com',
            'hours_label' => 'Hours',
            'hours' => 'Sat–Thu, 10am – 8pm',
            'side_image' => 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=1000&q=80',
            'form_eyebrow' => 'Message',
            'form_title' => 'Write to us',
            'form_success' => 'Thanks! Your message has been received.',
            'form_button' => 'Send message',
        ];
    }

    public static function footer(): array
    {
        return [
            'blurb' => 'Soft, safe and trusted baby care products — delivered to your door.',
            'links_title' => 'Quick links',
            'support_title' => 'Support',
            'hotline' => '01700-000000',
            'email' => 'hello@babubazer.com',
            'note' => 'Fast delivery across Bangladesh',
            'copyright_suffix' => 'Made for little ones.',
        ];
    }
}
