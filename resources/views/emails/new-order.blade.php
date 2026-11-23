<!doctype html>
<html>
<body style="margin:0;padding:0;background:#fff9f0;font-family:Arial,Helvetica,sans-serif;color:#24324a;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#fff9f0;padding:24px 12px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #f1e3cf;">
    <tr>
        <td style="background:#ff9d16;color:#ffffff;padding:20px 24px;">
            <div style="font-size:13px;letter-spacing:1px;text-transform:uppercase;opacity:.9;">{{ config('app.name') }}</div>
            <div style="font-size:22px;font-weight:bold;margin-top:4px;">New order received</div>
        </td>
    </tr>
    <tr>
        <td style="padding:24px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
                <tr>
                    <td style="padding:4px 0;color:#5d6b82;">Order</td>
                    <td align="right" style="padding:4px 0;font-weight:bold;">{{ $order->order_number }}</td>
                </tr>
                <tr>
                    <td style="padding:4px 0;color:#5d6b82;">Placed</td>
                    <td align="right" style="padding:4px 0;">{{ $order->created_at?->setTimezone(config('app.business_timezone', 'Asia/Dhaka'))->format('d M Y, h:i A') }}</td>
                </tr>
                <tr>
                    <td style="padding:4px 0;color:#5d6b82;">Payment</td>
                    <td align="right" style="padding:4px 0;">{{ strtoupper($order->payment_method) === 'COD' ? 'Cash on delivery' : strtoupper($order->payment_method) }}</td>
                </tr>
                <tr>
                    <td style="padding:4px 0;color:#5d6b82;">Account</td>
                    <td align="right" style="padding:4px 0;">{{ $order->user_id ? 'Registered customer' : 'Guest' }}</td>
                </tr>
            </table>

            <div style="margin:20px 0 6px;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:.5px;color:#5d6b82;">Customer</div>
            <div style="font-size:14px;line-height:1.6;">
                <strong>{{ $order->customer_name }}</strong><br>
                Phone: {{ $order->customer_phone }}<br>
                @if ($order->customer_email) Email: {{ $order->customer_email }}<br>@endif
                {{ $order->shipping_address }}<br>
                {{ collect([$order->city, $order->division])->filter()->implode(', ') }}
            </div>
            @if ($order->notes)
                <div style="margin-top:10px;padding:10px 12px;background:#fff9f0;border-radius:8px;font-size:13px;">
                    <strong>Note:</strong> {{ $order->notes }}
                </div>
            @endif

            <div style="margin:22px 0 6px;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:.5px;color:#5d6b82;">Items</div>
            <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;border-collapse:collapse;">
                @foreach ($items as $item)
                    <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #f1e3cf;">
                            {{ $item->product_name }}
                            <div style="font-size:12px;color:#5d6b82;">{{ $item->quantity }} x {{ number_format((float) $item->unit_price, 0) }} BDT</div>
                        </td>
                        <td align="right" style="padding:8px 0;border-bottom:1px solid #f1e3cf;white-space:nowrap;">{{ number_format((float) $item->line_total, 0) }} BDT</td>
                    </tr>
                @endforeach
            </table>

            <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;margin-top:10px;">
                <tr>
                    <td style="padding:3px 0;color:#5d6b82;">Subtotal</td>
                    <td align="right">{{ number_format((float) $order->subtotal, 0) }} BDT</td>
                </tr>
                <tr>
                    <td style="padding:3px 0;color:#5d6b82;">Delivery</td>
                    <td align="right">{{ number_format((float) $order->shipping_fee, 0) }} BDT</td>
                </tr>
                <tr>
                    <td style="padding:8px 0 0;font-size:16px;font-weight:bold;">Total to collect</td>
                    <td align="right" style="padding:8px 0 0;font-size:18px;font-weight:bold;color:#e97800;">{{ number_format((float) $order->total, 0) }} BDT</td>
                </tr>
            </table>

            <div style="margin-top:26px;text-align:center;">
                <a href="{{ $adminUrl }}" style="display:inline-block;background:#ff9d16;color:#ffffff;text-decoration:none;font-weight:bold;font-size:14px;padding:12px 26px;border-radius:999px;">Open order in admin</a>
            </div>
        </td>
    </tr>
</table>
</td></tr>
</table>
</body>
</html>
