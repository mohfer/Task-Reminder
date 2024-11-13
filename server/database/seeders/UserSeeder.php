<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'name' => 'Alice Smith',
                'email' => 'alice.smith@example.com',
                'phone' => '9876543210',
                'password' => bcrypt('password123'),
            ],
            [
                'name' => 'Bob Johnson',
                'email' => 'bob.johnson@example.com',
                'phone' => '5432167890',
                'password' => bcrypt('secure456'),
            ],
            [
                'name' => 'Charlie Brown',
                'email' => 'charlie.brown@example.com',
                'phone' => '1230984567',
                'password' => bcrypt('12345678'),
            ],
            [
                'name' => 'David Williams',
                'email' => 'david.williams@example.com',
                'phone' => '3216549870',
                'password' => bcrypt('david@123'),
            ],
            [
                'name' => 'Eve White',
                'email' => 'eve.white@example.com',
                'phone' => '6541237890',
                'password' => bcrypt('eve@secure'),
            ],
            [
                'name' => 'Frank Green',
                'email' => 'frank.green@example.com',
                'phone' => '7896541230',
                'password' => bcrypt('frank456'),
            ],
            [
                'name' => 'Grace Lee',
                'email' => 'grace.lee@example.com',
                'phone' => '4561230987',
                'password' => bcrypt('grace@123'),
            ],
            [
                'name' => 'Henry Clark',
                'email' => 'henry.clark@example.com',
                'phone' => '3219876540',
                'password' => bcrypt('henrypassword'),
            ],
            [
                'name' => 'Ivy Scott',
                'email' => 'ivy.scott@example.com',
                'phone' => '5678901234',
                'password' => bcrypt('ivy@secure2024'),
            ],
            [
                'name' => 'Jack Harris',
                'email' => 'jack.harris@example.com',
                'phone' => '9081726354',
                'password' => bcrypt('jack@321'),
            ],
        ];

        foreach ($users as $user) {
            User::create($user);
        }
    }
}
