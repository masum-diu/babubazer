<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class NewOrderMail extends Mailable
{
    public function __construct(public Order $order) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New order '.$this->order->order_number.' - '.number_format((float) $this->order->total, 0).' BDT',
            replyTo: $this->order->customer_email
                ? [new Address($this->order->customer_email, $this->order->customer_name)]
                : [],
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.new-order',
            with: [
                'order' => $this->order,
                'items' => $this->order->items,
                'adminUrl' => url('/admin/orders/'.$this->order->id),
            ],
        );
    }
}
