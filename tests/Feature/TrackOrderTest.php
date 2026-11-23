<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TrackOrderTest extends TestCase
{
    use RefreshDatabase;

    private function order(array $overrides = []): Order
    {
        return Order::create(array_merge([
            'order_number' => 'BB-261123-AAAAA',
            'customer_name' => 'Nusrat Jahan',
            'customer_email' => 'nusrat@example.com',
            'customer_phone' => '01711111111',
            'shipping_address' => 'House 5, Road 3, Secret Lane',
            'division' => 'Dhaka',
            'city' => 'Dhaka',
            'payment_method' => 'cod',
            'status' => 'pending',
            'subtotal' => 200,
            'shipping_fee' => 80,
            'total' => 280,
        ], $overrides));
    }

    public function test_guests_cannot_see_or_track_any_order(): void
    {
        $order = $this->order();

        $this->get(route('track.show', $order->order_number))->assertRedirect(route('login'));
        $this->get('/orders/'.$order->id)->assertForbidden();
        $this->get('/account/orders')->assertRedirect(route('login'));

        // no public "enter order number + phone" lookup any more
        $this->get('/track-order')->assertNotFound();
        $this->post('/track-order', ['order_number' => $order->order_number, 'phone' => '01711111111'])
            ->assertStatus(404);
    }

    public function test_a_guest_who_just_ordered_still_cannot_open_the_tracking_page(): void
    {
        $category = Category::create(['name' => 'Toys', 'slug' => 'toys']);
        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Rattle',
            'slug' => 'rattle',
            'price' => 100,
            'stock' => 10,
        ]);

        $this->post('/guest');
        $this->post('/cart', ['product_id' => $product->id, 'quantity' => 1]);
        $this->post('/checkout', [
            'customer_name' => 'Guest Buyer',
            'customer_email' => 'g@example.com',
            'customer_phone' => '01722222222',
            'shipping_address' => 'Somewhere',
            'division' => 'Dhaka',
            'city' => 'Dhaka',
            'payment_method' => 'cod',
        ]);
        $order = Order::firstOrFail();

        // the short thank-you page is all a guest gets
        $this->get(route('orders.confirmed', $order))->assertOk();
        $this->get(route('track.show', $order->order_number))->assertRedirect(route('login'));
        $this->get('/orders/'.$order->id)->assertForbidden();
    }

    public function test_registered_customer_sees_the_status_of_their_own_order(): void
    {
        $user = User::factory()->create();
        $order = $this->order(['user_id' => $user->id]);

        foreach (['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] as $status) {
            $order->update(['status' => $status]);

            $this->actingAs($user)->get(route('track.show', $order->order_number))
                ->assertOk()
                ->assertInertia(fn ($page) => $page
                    ->component('orders/track')
                    ->where('order.order_number', 'BB-261123-AAAAA')
                    ->where('order.status', $status)
                    ->where('order.first_name', 'Nusrat')
                    ->where('order.total', '280.00'));
        }
    }

    public function test_customer_cannot_open_someone_elses_order(): void
    {
        $user = User::factory()->create();
        $theirs = $this->order(['user_id' => User::factory()->create()->id]);
        $guestOrder = $this->order(['order_number' => 'BB-261123-BBBBB', 'user_id' => null]);

        $this->actingAs($user)->get(route('track.show', $theirs->order_number))
            ->assertRedirect(route('account.orders'));
        $this->actingAs($user)->get(route('track.show', $guestOrder->order_number))
            ->assertRedirect(route('account.orders'));
        $this->actingAs($user)->get(route('track.show', 'BB-NOPE'))
            ->assertRedirect(route('account.orders'));
        $this->actingAs($user)->get('/orders/'.$theirs->id)->assertForbidden();
    }

    public function test_tracking_page_hides_private_details(): void
    {
        $user = User::factory()->create();
        $order = $this->order(['user_id' => $user->id]);

        $response = $this->actingAs($user)->get(route('track.show', $order->order_number));
        $json = json_encode($response->viewData('page')['props']['order']);

        $this->assertStringNotContainsString('Secret Lane', $json);
        $this->assertStringNotContainsString('01711111111', $json);
        $this->assertStringNotContainsString('nusrat@example.com', $json);
    }

    public function test_my_orders_list_only_shows_the_customers_own_orders(): void
    {
        $user = User::factory()->create();
        $mine = $this->order(['user_id' => $user->id]);
        $this->order(['order_number' => 'BB-261123-BBBBB', 'user_id' => User::factory()->create()->id]);

        $this->actingAs($user)->get('/account/orders')
            ->assertInertia(fn ($page) => $page
                ->where('orders.total', 1)
                ->where('orders.data.0.order_number', $mine->order_number));
    }

    public function test_old_order_details_link_redirects_the_owner_to_tracking(): void
    {
        $user = User::factory()->create();
        $mine = $this->order(['user_id' => $user->id]);

        $this->actingAs($user)->get('/orders/'.$mine->id)
            ->assertRedirect(route('track.show', $mine->order_number));
    }

    public function test_admin_can_open_any_order_tracking_page(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $order = $this->order();

        $this->actingAs($admin)->get(route('track.show', $order->order_number))->assertOk();
    }
}
