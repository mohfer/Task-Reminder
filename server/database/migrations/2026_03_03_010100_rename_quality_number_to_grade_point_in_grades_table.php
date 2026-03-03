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
        if (!Schema::hasColumn('grades', 'quality_number') || Schema::hasColumn('grades', 'grade_point')) {
            return;
        }

        Schema::table('grades', function (Blueprint $table) {
            $table->renameColumn('quality_number', 'grade_point');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (!Schema::hasColumn('grades', 'grade_point') || Schema::hasColumn('grades', 'quality_number')) {
            return;
        }

        Schema::table('grades', function (Blueprint $table) {
            $table->renameColumn('grade_point', 'quality_number');
        });
    }
};
