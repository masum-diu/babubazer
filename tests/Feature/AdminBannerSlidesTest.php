<?php

namespace Tests\Feature;

use App\Models\SitePage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminBannerSlidesTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_manage_homepage_banner_slides(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $this->actingAs($admin)
            ->get('/admin/pages?page=home')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('page.slug', 'home')
                ->where('page.content.banner_slides.0.title', 'Big care for little ones — delivered home')
                ->where('fields.0.key', 'banner_slides'));

        $this->actingAs($admin)
            ->put('/admin/pages/home', [
                'banner_slides' => [
                    [
                        'brand' => 'BabuBazer',
                        'title' => 'First banner',
                        'text' => 'First description',
                        'image' => 'https://example.test/first.jpg',
                        'primary' => 'Shop',
                        'primary_url' => '/shop',
                        'secondary' => '',
                        'secondary_url' => '/shop',
                    ],
                    [
                        'brand' => 'BabuBazer',
                        'title' => 'Second banner',
                        'text' => 'Second description',
                        'image' => 'https://example.test/second.jpg',
                        'primary' => 'Browse',
                        'primary_url' => '/shop',
                        'secondary' => '',
                        'secondary_url' => '/shop',
                    ],
                ],
            ])
            ->assertRedirect();

        $slides = SitePage::query()
            ->where('slug', 'home')
            ->firstOrFail()
            ->content['banner_slides'];

        $this->assertCount(2, $slides);
        $this->assertSame('First banner', $slides[0]['title']);
        $this->assertSame('Second banner', $slides[1]['title']);
        $this->assertSame('https://example.test/first.jpg', $slides[0]['image']);

        $this->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('bannerSlides.0.title', 'First banner')
                ->where('bannerSlides.1.title', 'Second banner'));
    }

    public function test_banner_slides_require_an_image(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $this->actingAs($admin)
            ->from('/admin/pages?page=home')
            ->put('/admin/pages/home', [
                'banner_slides' => [
                    [
                        'brand' => 'BabuBazer',
                        'title' => 'Missing image',
                        'text' => '',
                        'image' => '',
                        'primary' => 'Shop',
                        'primary_url' => '/shop',
                        'secondary' => '',
                        'secondary_url' => '/shop',
                    ],
                ],
            ])
            ->assertRedirect('/admin/pages?page=home')
            ->assertSessionHasErrors('banner_slides.0.image');
    }
}
