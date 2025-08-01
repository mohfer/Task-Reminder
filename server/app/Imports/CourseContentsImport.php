<?php

namespace App\Imports;

use Maatwebsite\Excel\Concerns\ToArray;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class CourseContentsImport implements ToArray, WithHeadingRow
{
    /**
     * @param array $rows
     *
     * @return array
     */
    public function array(array $rows)
    {
        return $rows;
    }
}
