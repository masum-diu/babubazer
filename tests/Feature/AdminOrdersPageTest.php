<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminOrdersPageTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create(['is_admin' => true]);
    }

    private function order(array $overrides = []): Order
    {
        static $n = 0;
        $n++;

        return Order::create(array_merge([
            'order_number' => 'BB-TEST-'.str_pad((string) $n, 4, '0', STR_PAD_LEFT),
            'customer_name' => 'Customer '.$n,
            'customer_email' => "c{$n}@example.com",
            'customer_phone' => '0170000'.str_pad((string) $n, 4, '0', STR_PAD_LEFT),
            'shipping_address' => 'Road '.$n,
            'division' => 'Dhaka',
            'city' => 'Dhaka',
            'payment_method' => 'cod',
            'status' => 'pending',
            'subtotal' => 100,
            'shipping_fee' => 80,
            'total' => 180,
        ], $overrides));
    }

    public function test_guests_and_customers_cannot_see_orders(): void
    {
        $this->get('/admin/orders')->assertRedirect();
        $this->actingAs(User::factory()->create())->get('/admin/orders')->assertForbidden();
    }

    public function test_orders_page_lists_with_pagination_fields(): void
    {
        foreach (range(1, 17) as $i) {
            $this->order();
        }

        $this->actingAs($this->admin())->get('/admin/orders')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('admin/orders/index')
                ->where('orders.total', 17)
                ->where('orders.last_page', 2)
                ->where('orders.from', 1)
                ->where('orders.to', 15)
                ->where('stats.all', 17));
    }

    public function test_search_matches_number_name_email_and_phone(): void
    {
        $this->order(['customer_name' => 'Rahim Uddin', 'customer_email' => 'rahim@mail.com', 'customer_phone' => '01811111111']);
        $this->order(['customer_name' => 'Karim Ali']);
        $admin = $this->admin();

        foreach (['Rahim', 'rahim@mail', '01811111'] as $term) {
            $this->actingAs($admin)->get('/admin/orders?q='.$term)
                ->assertInertia(fn ($page) => $page
                    ->where('orders.total', 1)
                    ->where('orders.data.0.customer_name', 'Rahim Uddin'));
        }

        $this->actingAs($admin)->get('/admin/orders?q=Nobody')
            ->assertInertia(fn ($page) => $page->where('orders.total', 0));
    }

    public function test_status_and_date_filters(): void
    {
        $this->order(['status' => 'pending']);
        $this->order(['status' => 'delivered']);
        $old = $this->order(['status' => 'pending']);
        $old->forceFill(['created_at' => now()->subDays(10)])->save();
        $admin = $this->admin();

        $this->actingAs($admin)->get('/admin/orders?status=delivered')
            ->assertInertia(fn ($page) => $page->where('orders.total', 1)->where('filters.status', 'delivered'));

        $this->actingAs($admin)->get('/admin/orders?from='.now()->subDays(2)->toDateString())
            ->assertInertia(fn ($page) => $page->where('orders.total', 2));

        $this->actingAs($admin)->get('/admin/orders?to='.now()->subDays(5)->toDateString())
            ->assertInertia(fn ($page) => $page->where('orders.total', 1));
    }

    public function test_date_filter_uses_bangladesh_calendar_days(): void
    {
        // 18:30 UTC on the 4th = 00:30 on the 5th in Dhaka.
        $late = $this->order();
        $late->forceFill(['created_at' => \Illuminate\Support\Carbon::parse('2026-11-04 18:30:00', 'UTC')])->save();
        $admin = $this->admin();

        $this->actingAs($admin)->get('/admin/orders?from=2026-11-05&to=2026-11-05')
            ->assertInertia(fn ($page) => $page->where('orders.total', 1));

        $this->actingAs($admin)->get('/admin/orders?from=2026-11-04&to=2026-11-04')
            ->assertInertia(fn ($page) => $page->where('orders.total', 0));
    }

    public function test_guest_orders_without_an_account_are_listed(): void
    {
        $this->order(['user_id' => null, 'customer_name' => 'Walk In']);

        $this->actingAs($this->admin())->get('/admin/orders')
            ->assertInertia(fn ($page) => $page->where('orders.data.0.customer_name', 'Walk In'));
    }

    public function test_export_downloads_csv_for_filters_or_selected_rows(): void
    {
        $a = $this->order(['customer_name' => 'Alpha', 'status' => 'pending']);
        $b = $this->order(['customer_name' => 'Bravo', 'status' => 'delivered']);
        $admin = $this->admin();

        $all = $this->actingAs($admin)->get('/admin/orders/export');
        $all->assertOk()->assertHeader('content-type', 'text/csv; charset=UTF-8');
        $csv = $all->streamedContent();
        $this->assertStringContainsString('Order,Date,Customer', $csv);
        $this->assertStringContainsString('Alpha', $csv);
        $this->assertStringContainsString('Bravo', $csv);

        $delivered = $this->actingAs($admin)->get('/admin/orders/export?status=delivered')->streamedContent();
        $this->assertStringContainsString('Bravo', $delivered);
        $this->assertStringNotContainsString('Alpha', $delivered);

        $picked = $this->actingAs($admin)->get('/admin/orders/export?ids='.$a->id)->streamedContent();
        $this->assertStringContainsString('Alpha', $picked);
        $this->assertStringNotContainsString('Bravo', $picked);
    }

    public function test_status_can_be_changed_from_the_list_popup_request(): void
    {
        $order = $this->order(['status' => 'pending']);
        $admin = $this->admin();

        $this->actingAs($admin)->patch("/admin/orders/{$order->id}", ['status' => 'shipped'])
            ->assertSessionHas('success');
        $this->assertSame('shipped', $order->fresh()->status);

        $this->actingAs($admin)->patch("/admin/orders/{$order->id}", ['status' => 'bogus'])
            ->assertSessionHasErrors('status');
        $this->assertSame('shipped', $order->fresh()->status);
    }

    public function test_only_admins_can_change_status(): void
    {
        $order = $this->order(['status' => 'pending']);

        $this->actingAs(User::factory()->create())
            ->patch("/admin/orders/{$order->id}", ['status' => 'delivered'])
            ->assertForbidden();

        $this->assertSame('pending', $order->fresh()->status);
    }

    public function test_export_is_admin_only(): void
    {
        $this->actingAs(User::factory()->create())->get('/admin/orders/export')->assertForbidden();
    }
}
