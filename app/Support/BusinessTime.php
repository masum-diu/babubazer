<?php

namespace App\Support;

use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;

/**
 * Orders are stored in the app timezone (UTC), but the shop works in Bangladesh time.
 * Reports and date filters use this so "today", a day's sales and filter ranges
 * line up with the shop's calendar day instead of the UTC day.
 */
class BusinessTime
{
    public static function timezone(): string
    {
        return (string) config('app.business_timezone', 'Asia/Dhaka');
    }

    public static function today(): CarbonImmutable
    {
        return CarbonImmutable::now(self::timezone())->startOfDay();
    }

    /** First instant of a business day, expressed in the app (storage) timezone. */
    public static function dayStart(CarbonInterface|string $date): CarbonImmutable
    {
        return self::day($date)->startOfDay()->setTimezone(config('app.timezone'));
    }

    /** Last instant of a business day, expressed in the app (storage) timezone. */
    public static function dayEnd(CarbonInterface|string $date): CarbonImmutable
    {
        return self::day($date)->endOfDay()->setTimezone(config('app.timezone'));
    }

    /** Business calendar date (Y-m-d) of a stored timestamp. */
    public static function dateOf(CarbonInterface $stored): string
    {
        return CarbonImmutable::instance($stored)->setTimezone(self::timezone())->toDateString();
    }

    private static function day(CarbonInterface|string $date): CarbonImmutable
    {
        $string = $date instanceof CarbonInterface ? $date->toDateString() : (string) $date;

        return CarbonImmutable::createFromFormat('Y-m-d', $string, self::timezone());
    }
}
