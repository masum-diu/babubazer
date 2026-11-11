<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class MediaLibraryTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_the_media_library(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('media/example.jpg', 'image content');
        $admin = User::factory()->create(['is_admin' => true]);

        $this->actingAs($admin)
            ->get('/admin/media')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('media', 1)
                ->where('media.0.name', 'example.jpg')
                ->where('media.0.url', url('/storage/media/example.jpg')));
    }

    public function test_guest_cannot_open_the_media_library(): void
    {
        $this->get('/admin/media')->assertRedirect('/admin');
    }
}
