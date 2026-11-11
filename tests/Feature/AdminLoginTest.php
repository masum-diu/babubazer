<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminLoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_path_displays_the_separate_admin_login_page_for_guests(): void
    {
        $this->get('/admin')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('admin/login'));
    }

    public function test_admin_login_redirects_to_the_control_room_dashboard(): void
    {
        $admin = User::factory()->create([
            'is_admin' => true,
            'password' => 'password',
        ]);

        $this->post('/admin/login', [
            'email' => $admin->email,
            'password' => 'password',
        ])->assertRedirect(route('admin.dashboard'));

        $this->assertAuthenticatedAs($admin);
        $this->get(route('admin.dashboard'))->assertOk();
    }

    public function test_customer_cannot_sign_in_through_admin_login(): void
    {
        $customer = User::factory()->create([
            'is_admin' => false,
            'password' => 'password',
        ]);

        $this->from('/admin')
            ->post('/admin/login', [
                'email' => $customer->email,
                'password' => 'password',
            ])
            ->assertRedirect('/admin')
            ->assertSessionHasErrors('email');

        $this->assertGuest();
    }

    public function test_admin_dashboard_requires_admin_authentication(): void
    {
        $this->get(route('admin.dashboard'))
            ->assertRedirect('/admin');
    }
}
