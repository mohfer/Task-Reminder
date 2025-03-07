<?php

namespace App\Helpers;

class DateHelper
{
    public static function getIndonesianMonth($month)
    {
        $months = [
            '01' => 'Januari',
            '02' => 'Februari',
            '03' => 'Maret',
            '04' => 'April',
            '05' => 'Mei',
            '06' => 'Juni',
            '07' => 'Juli',
            '08' => 'Agustus',
            '09' => 'September',
            '10' => 'Oktober',
            '11' => 'November',
            '12' => 'Desember'
        ];

        return $months[$month] ?? $month;
    }

    public static function formatIndonesianDate($date)
    {
        if (!$date) return null;

        $carbon = \Carbon\Carbon::parse($date);
        return (int)$carbon->format('d') . ' ' . self::getIndonesianMonth($carbon->format('m')) . ' ' . $carbon->format('Y');
    }
}
