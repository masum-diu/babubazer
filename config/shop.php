<?php

return [

    /*
    | Who gets an email whenever a customer places an order.
    | Set ORDER_NOTIFICATION_EMAIL in .env (several addresses separated with commas).
    | Empty or missing = no order emails are sent.
    */

    'order_notification_email' => env('ORDER_NOTIFICATION_EMAIL', ''),

];
