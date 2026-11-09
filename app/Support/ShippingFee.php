<?php

namespace App\Support;

class ShippingFee
{
    public const DHAKA = 60.0;

    public const OUTSIDE_DHAKA = 120.0;

    public static function forDivision(?string $division): float
    {
        if ($division === null || $division === '') {
            return self::DHAKA;
        }

        return strcasecmp($division, 'Dhaka') === 0
            ? self::DHAKA
            : self::OUTSIDE_DHAKA;
    }

    /** @return array{dhaka:float,outside:float} */
    public static function rates(): array
    {
        return [
            'dhaka' => self::DHAKA,
            'outside' => self::OUTSIDE_DHAKA,
        ];
    }
}
