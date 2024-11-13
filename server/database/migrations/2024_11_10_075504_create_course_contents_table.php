<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('course_contents', function (Blueprint $table) {
            $table->id();
            $table->string('semester');
            $table->string('code')->unique();
            $table->string('course_content')->unique();
            $table->integer('scu');
            $table->string('lecturer');
            $table->string('day');
            $table->time('hour_start');
            $table->time('hour_end');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('course_contents');
    }
};
