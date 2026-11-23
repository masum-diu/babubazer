<?php

namespace Tests\Feature;

use App\Mail\NewOrderMail;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class OrderNotificationTest extends TestCase
{
    use RefreshDatabase;

    private function product(): Product
    {
        $category = Category::create(['name' => 'Toys', 'slug' => 'toys']);

        return Product::create([
            'category_id' => $category->id,
            'name' => 'Rattle',
            'slug' => 'rattle',
            'price' => 100,
            'stock' => 10,
        ]);
    }

    private function payload(string $payment = 'cod'): array
    {
        return [
            'customer_name' => 'Nusrat Jahan',
            'customer_email' => 'nusrat@example.com',
            'customer_phone' => '01711111111',
            'shipping_address' => 'House 5, Road 3',
            'division' => 'Dhaka',
            'city' => 'Dhaka',
            'payment_method' => $payment,
            'notes' => 'Call before delivery',
        ];
    }

    private function placeOrder(bool $asGuest = false, int $quantity = 2): void
    {
        $product = $this->product();

        if ($asGuest) {
            $this->post('/guest');
        } else {
            $this->actingAs(User::factory()->create());
        }

        $this->post('/cart', ['product_id' => $product->id, 'quantity' => $quantity]);
        $this->post('/checkout', $this->payload());
    }

    public function test_shop_owner_is_emailed_when_a_customer_orders(): void
    {
        Mail::fake();

        $this->placeOrder();

        $order = Order::firstOrFail();
        Mail::assertSent(NewOrderMail::class, function (NewOrderMail $mail) use ($order) {
            return $mail->hasTo('nashitaiftekhar@gmail.com')
                && $mail->order->is($order)
                && str_contains($mail->envelope()->subject, $order->order_number)
                && $mail->hasReplyTo('nusrat@example.com');
        });
        Mail::assertSentCount(1);
    }

    public function test_guest_orders_are_emailed_too(): void
    {
        Mail::fake();

        $this->placeOrder(asGuest: true);

        Mail::assertSent(NewOrderMail::class, fn ($mail) => $mail->hasTo('nashitaiftekhar@gmail.com'));
    }

    public function test_several_recipients_can_be_configured(): void
    {
        Mail::fake();
        config(['shop.order_notification_email' => 'a@example.com, b@example.com']);

        $this->placeOrder();

        Mail::assertSent(NewOrderMail::class, fn ($mail) => $mail->hasTo('a@example.com') && $mail->hasTo('b@example.com'));
    }

    public function test_notification_can_be_switched_off(): void
    {
        Mail::fake();
        config(['shop.order_notification_email' => '']);

        $this->placeOrder();

        $this->assertSame(1, Order::count());
        Mail::assertNothingSent();
    }

    public function test_no_email_when_the_order_is_rejected(): void
    {
        Mail::fake();
        $product = $this->product();
        $this->actingAs(User::factory()->create());
        $this->post('/cart', ['product_id' => $product->id, 'quantity' => 1]);

        $this->post('/checkout', $this->payload('bkash'))->assertSessionHasErrors('payment_method');

        $this->assertSame(0, Order::count());
        Mail::assertNothingSent();
    }

    public function test_a_mail_failure_never_breaks_the_order(): void
    {
        Mail::shouldReceive('to')->once()->andThrow(new \RuntimeException('smtp down'));

        $product = $this->product();
        $this->actingAs(User::factory()->create());
        $this->post('/cart', ['product_id' => $product->id, 'quantity' => 1]);

        $this->post('/checkout', $this->payload())->assertSessionHasNoErrors();

        $order = Order::firstOrFail();
        $this->assertSame(9, $product->fresh()->stock);
        $this->assertNotNull($order->id);
    }

    public function test_email_shows_the_details_the_owner_needs(): void
    {
        Mail::fake();
        $this->placeOrder(quantity: 2);
        $order = Order::with('items')->firstOrFail();

        $html = (new NewOrderMail($order))->render();

        $this->assertStringContainsString($order->order_number, $html);
        $this->assertStringContainsString('Nusrat Jahan', $html);
        $this->assertStringContainsString('01711111111', $html);
        $this->assertStringContainsString('House 5, Road 3', $html);
        $this->assertStringContainsString('Call before delivery', $html);
        $this->assertStringContainsString('Rattle', $html);
        $this->assertStringContainsString('Cash on delivery', $html);
        $this->assertStringContainsString('280 BDT', $html); // 200 + 80 delivery
        $this->assertStringContainsString('/admin/orders/'.$order->id, $html);
    }
}
