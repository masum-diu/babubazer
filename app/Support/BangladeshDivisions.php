<?php

namespace App\Support;

class BangladeshDivisions
{
    /**
     * All Bangladesh divisions with their districts.
     *
     * @return array<string, list<string>>
     */
    public static function tree(): array
    {
        return [
            'Barishal' => [
                'Barguna',
                'Barishal',
                'Bhola',
                'Jhalokathi',
                'Patuakhali',
                'Pirojpur',
            ],
            'Chattogram' => [
                'Bandarban',
                'Brahmanbaria',
                'Chandpur',
                'Chattogram',
                'Cumilla',
                "Cox's Bazar",
                'Feni',
                'Khagrachhari',
                'Lakshmipur',
                'Noakhali',
                'Rangamati',
            ],
            'Dhaka' => [
                'Dhaka',
                'Faridpur',
                'Gazipur',
                'Gopalganj',
                'Kishoreganj',
                'Madaripur',
                'Manikganj',
                'Munshiganj',
                'Narayanganj',
                'Narsingdi',
                'Rajbari',
                'Shariatpur',
                'Tangail',
            ],
            'Khulna' => [
                'Bagerhat',
                'Chuadanga',
                'Jashore',
                'Jhenaidah',
                'Khulna',
                'Kushtia',
                'Magura',
                'Meherpur',
                'Narail',
                'Satkhira',
            ],
            'Mymensingh' => [
                'Jamalpur',
                'Mymensingh',
                'Netrokona',
                'Sherpur',
            ],
            'Rajshahi' => [
                'Bogura',
                'Joypurhat',
                'Naogaon',
                'Natore',
                'Chapai Nawabganj',
                'Pabna',
                'Rajshahi',
                'Sirajganj',
            ],
            'Rangpur' => [
                'Dinajpur',
                'Gaibandha',
                'Kurigram',
                'Lalmonirhat',
                'Nilphamari',
                'Panchagarh',
                'Rangpur',
                'Thakurgaon',
            ],
            'Sylhet' => [
                'Habiganj',
                'Moulvibazar',
                'Sunamganj',
                'Sylhet',
            ],
        ];
    }

    /** @return list<string> */
    public static function all(): array
    {
        return array_keys(self::tree());
    }

    /** @return list<string> */
    public static function districts(?string $division = null): array
    {
        $tree = self::tree();

        if ($division === null || $division === '') {
            return array_values(array_unique(array_merge(...array_values($tree))));
        }

        return $tree[$division] ?? [];
    }

    public static function isValidDistrict(string $division, string $district): bool
    {
        return in_array($district, self::districts($division), true);
    }
}
