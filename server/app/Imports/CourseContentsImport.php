<?php

namespace App\Imports;

use Maatwebsite\Excel\Concerns\ToArray;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class CourseContentsImport implements ToArray, WithHeadingRow
{
    public function array(array $array): void
    {
    }
}
