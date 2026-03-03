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
        if (!Schema::hasColumn('course_contents', 'scu') || Schema::hasColumn('course_contents', 'credits')) {
            return;
        }

        Schema::table('course_contents', function (Blueprint $table) {
            $table->renameColumn('scu', 'credits');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (!Schema::hasColumn('course_contents', 'credits') || Schema::hasColumn('course_contents', 'scu')) {
            return;
        }

        Schema::table('course_contents', function (Blueprint $table) {
            $table->renameColumn('credits', 'scu');
        });
    }
};
