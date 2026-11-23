<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CheckoutPaymentTest extends TestCase
{
    use RefreshDatabase;

    private function product(int $stock = 10): Product
    {
        $category = Category::create(['name' => 'Toys', 'slug' => 'toys']);

        return Product::create([
            'category_id' => $category->id,
            'name' => 'Rattle',
            'slug' => 'rattle',
            'price' => 100,
            'stock' => $stock,
        ]);
    }

    private function payload(string $division, string $district, string $payment): array
    {
        return [
            'customer_name' => 'Test Buyer',
            'customer_email' => 'buyer@example.com',
            'customer_phone' => '01700000000',
            'shipping_address' => 'House 1, Road 2',
            'division' => $division,
            'city' => $district,
            'payment_method' => $payment,
        ];
    }

    public function test_cart_summary_has_no_delivery_charge(): void
    {
        $product = $this->product();
        $this->actingAs(User::factory()->create());
        $this->post('/cart', ['product_id' => $product->id, 'quantity' => 2]);

        $this->get('/cart')->assertInertia(fn ($page) => $page
            ->where('cart.subtotal', 200)
            ->where('cart.total', 200)
            ->missing('cart.shipping_fee'));
    }

    public function test_guest_has_no_bag_or_checkout_access(): void
    {
        $product = $this->product();

        $this->post('/cart', ['product_id' => $product->id, 'quantity' => 1])
            ->assertRedirect(route('login'));
        $this->get('/cart')->assertRedirect(route('login'));
        $this->get('/checkout')->assertRedirect(route('login'));
        $this->post('/checkout', $this->payload('Dhaka', 'Dhaka', 'cod'))
            ->assertRedirect(route('login'));

        $this->assertSame(0, \App\Models\CartItem::count());
        $this->assertSame(0, Order::count());
        $this->assertSame(10, $product->fresh()->stock);
    }

    public function test_guest_is_returned_to_the_product_page_after_login(): void
    {
        $product = $this->product();
        $user = User::factory()->create(['password' => 'secret-pass-123']);

        $this->from('/products/rattle')
            ->post('/cart', ['product_id' => $product->id, 'quantity' => 1])
            ->assertRedirect(route('login'))
            ->assertSessionHas('info');

        $this->post('/login', ['email' => $user->email, 'password' => 'secret-pass-123'])
            ->assertRedirect('/products/rattle');
    }

    public function test_guest_is_returned_to_checkout_after_login(): void
    {
        $user = User::factory()->create(['password' => 'secret-pass-123']);

        $this->get('/checkout')->assertRedirect(route('login'));

        $this->post('/login', ['email' => $user->email, 'password' => 'secret-pass-123'])
            ->assertRedirect('/checkout');
    }

    public function test_continue_as_guest_returns_to_the_previous_page(): void
    {
        $product = $this->product();

        $this->from('/products/rattle')
            ->post('/cart', ['product_id' => $product->id, 'quantity' => 1])
            ->assertRedirect(route('login'));

        $this->post('/guest')
            ->assertRedirect('/products/rattle')
            ->assertSessionHas('guest_checkout', true);
    }

    public function test_guest_can_order_after_choosing_continue_as_guest(): void
    {
        $product = $this->product();

        $this->post('/guest');
        $this->post('/cart', ['product_id' => $product->id, 'quantity' => 2])
            ->assertSessionHasNoErrors();

        $this->get('/checkout')->assertOk();
        $this->post('/checkout', $this->payload('Dhaka', 'Dhaka', 'cod'))
            ->assertSessionHasNoErrors();

        $order = Order::firstOrFail();
        $this->assertNull($order->user_id);
        $this->assertSame('cod', $order->payment_method);
        $this->assertEquals(80, $order->shipping_fee);
        $this->assertEquals(280, $order->total);
        $this->assertSame(8, $product->fresh()->stock);

        // a guest only gets the short thank-you page, never the order itself
        $this->get(route('orders.confirmed', $order))->assertOk();
        $this->get(route('track.show', $order->order_number))->assertRedirect(route('login'));
    }

    public function test_after_ordering_only_a_basic_thank_you_page_is_shown(): void
    {
        $product = $this->product();
        $this->actingAs(User::factory()->create());
        $this->post('/cart', ['product_id' => $product->id, 'quantity' => 1]);

        $response = $this->post('/checkout', $this->payload('Dhaka', 'Dhaka', 'cod'));

        $order = Order::firstOrFail();
        $response->assertRedirect(route('orders.confirmed', $order));

        $this->get(route('orders.confirmed', $order))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('orders/confirmed')
                ->where('orderNumber', $order->order_number)
                ->where('firstName', 'Test')
                ->missing('order')
                ->missing('items')
                ->has('orderNumber')
                ->etc());
    }

    public function test_thank_you_page_is_private_to_the_buyer(): void
    {
        $product = $this->product();
        $this->actingAs(User::factory()->create());
        $this->post('/cart', ['product_id' => $product->id, 'quantity' => 1]);
        $this->post('/checkout', $this->payload('Dhaka', 'Dhaka', 'cod'));
        $order = Order::firstOrFail();

        // someone else (another account, or a visitor who did not place it)
        $this->flushSession();
        $this->actingAs(User::factory()->create())
            ->get(route('orders.confirmed', $order))
            ->assertForbidden();
    }

    public function test_guest_sees_the_thank_you_page_for_their_own_order(): void
    {
        $product = $this->product();
        $this->post('/guest');
        $this->post('/cart', ['product_id' => $product->id, 'quantity' => 1]);
        $this->post('/checkout', $this->payload('Dhaka', 'Dhaka', 'cod'));
        $order = Order::firstOrFail();

        $this->get(route('orders.confirmed', $order))->assertOk();
    }

    public function test_guest_bag_moves_into_the_account_after_login(): void
    {
        $product = $this->product();
        $user = User::factory()->create(['password' => 'secret-pass-123']);

        $this->post('/guest');
        $this->post('/cart', ['product_id' => $product->id, 'quantity' => 1]);

        $this->post('/login', ['email' => $user->email, 'password' => 'secret-pass-123']);

        $this->assertDatabaseHas('cart_items', [
            'product_id' => $product->id,
            'user_id' => $user->id,
        ]);
    }

    public function test_guest_is_flagged_for_the_navbar_and_can_end_the_session(): void
    {
        $this->get('/')->assertInertia(fn ($page) => $page->where('guest', false));

        $this->post('/guest');
        $this->get('/')->assertInertia(fn ($page) => $page->where('guest', true));

        $this->post('/guest/leave')->assertRedirect(route('home'));
        $this->get('/')->assertInertia(fn ($page) => $page->where('guest', false));

        $product = $this->product();
        $this->post('/cart', ['product_id' => $product->id, 'quantity' => 1])
            ->assertRedirect(route('login'));
    }

    public function test_logged_in_customer_is_not_a_guest(): void
    {
        $this->post('/guest');
        $this->actingAs(User::factory()->create());

        $this->get('/')->assertInertia(fn ($page) => $page->where('guest', false));
    }

    public function test_wishlist_still_needs_an_account_even_as_guest(): void
    {
        $this->post('/guest');

        $this->get('/wishlist')->assertRedirect(route('login'));
    }

    public function test_only_cash_on_delivery_is_accepted(): void
    {
        $product = $this->product();
        $user = User::factory()->create();
        $this->actingAs($user);

        foreach (['bkash', 'nagad'] as $method) {
            $this->post('/cart', ['product_id' => $product->id, 'quantity' => 1]);

            $this->post('/checkout', $this->payload('Dhaka', 'Dhaka', $method))
                ->assertSessionHasErrors('payment_method');
        }

        $this->assertSame(0, Order::count());
        $this->assertSame(10, $product->fresh()->stock);
    }

    public function test_cod_order_inside_dhaka_costs_80_delivery_and_reduces_stock(): void
    {
        $product = $this->product();
        $user = User::factory()->create();
        $this->actingAs($user);
        $this->post('/cart', ['product_id' => $product->id, 'quantity' => 2]);

        $this->post('/checkout', $this->payload('Dhaka', 'Dhaka', 'cod'))
            ->assertSessionHasNoErrors();

        $order = Order::firstOrFail();
        $this->assertSame($user->id, $order->user_id);
        $this->assertSame('cod', $order->payment_method);
        $this->assertEquals(80, $order->shipping_fee);
        $this->assertEquals(280, $order->total);
        $this->assertSame(8, $product->fresh()->stock);
    }

    public function test_cod_order_outside_dhaka_costs_120_delivery(): void
    {
        $product = $this->product();
        $this->actingAs(User::factory()->create());
        $this->post('/cart', ['product_id' => $product->id, 'quantity' => 1]);

        $this->post('/checkout', $this->payload('Chattogram', 'Chattogram', 'cod'))
            ->assertSessionHasNoErrors();

        $order = Order::firstOrFail();
        $this->assertEquals(120, $order->shipping_fee);
        $this->assertEquals(220, $order->total);
    }
}
