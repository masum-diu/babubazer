<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_pages_render(): void
    {
        $this->get('/forgot-password')->assertOk();
        $this->get('/reset-password/some-token?email=a@b.com')->assertOk();
        $this->get('/login')->assertOk();
    }

    public function test_customer_gets_a_reset_link(): void
    {
        Notification::fake();
        $user = User::factory()->create(['email' => 'mum@example.com']);

        $this->post('/forgot-password', ['email' => 'mum@example.com'])
            ->assertSessionHas('success');

        Notification::assertSentTo($user, ResetPassword::class);
    }

    public function test_unknown_email_gets_the_same_answer_and_no_mail(): void
    {
        Notification::fake();

        $this->post('/forgot-password', ['email' => 'nobody@example.com'])
            ->assertSessionHas('success');

        Notification::assertNothingSent();
    }

    public function test_admin_accounts_cannot_reset_through_the_storefront(): void
    {
        Notification::fake();
        User::factory()->create(['email' => 'boss@example.com', 'is_admin' => true]);

        $this->post('/forgot-password', ['email' => 'boss@example.com'])
            ->assertSessionHas('success');

        Notification::assertNothingSent();
    }

    public function test_password_can_be_reset_with_a_valid_token_and_then_login_works(): void
    {
        $user = User::factory()->create(['email' => 'mum@example.com']);
        $token = Password::createToken($user);

        $this->post('/reset-password', [
            'token' => $token,
            'email' => 'mum@example.com',
            'password' => 'brand-new-pass-1',
            'password_confirmation' => 'brand-new-pass-1',
        ])->assertRedirect(route('login'))->assertSessionHas('success');

        $this->assertTrue(Hash::check('brand-new-pass-1', $user->fresh()->password));

        $this->post('/login', ['email' => 'mum@example.com', 'password' => 'brand-new-pass-1'])
            ->assertRedirect(route('home'));
    }

    public function test_invalid_token_is_rejected(): void
    {
        $user = User::factory()->create(['email' => 'mum@example.com']);
        $before = $user->password;

        $this->post('/reset-password', [
            'token' => 'wrong-token',
            'email' => 'mum@example.com',
            'password' => 'brand-new-pass-1',
            'password_confirmation' => 'brand-new-pass-1',
        ])->assertSessionHasErrors('email');

        $this->assertSame($before, $user->fresh()->password);
    }
}
