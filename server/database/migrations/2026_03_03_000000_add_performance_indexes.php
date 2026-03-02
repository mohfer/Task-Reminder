<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('course_contents', function (Blueprint $table) {
            $table->index(['user_id', 'semester'], 'idx_cc_user_semester');
        });

        Schema::table('tasks', function (Blueprint $table) {
            $table->index(['user_id', 'status'], 'idx_tasks_user_status');
            $table->index('deadline', 'idx_tasks_deadline');
            $table->index('course_content_id', 'idx_tasks_course_content');
        });

        Schema::table('settings', function (Blueprint $table) {
            $table->unique('user_id', 'uq_settings_user');
        });

        Schema::table('grades', function (Blueprint $table) {
            $table->unique(['user_id', 'grade'], 'uq_grades_user_grade');
        });
    }

    public function down(): void
    {
        Schema::table('course_contents', function (Blueprint $table) {
            $table->dropIndex('idx_cc_user_semester');
        });

        Schema::table('tasks', function (Blueprint $table) {
            $table->dropIndex('idx_tasks_user_status');
            $table->dropIndex('idx_tasks_deadline');
            $table->dropIndex('idx_tasks_course_content');
        });

        Schema::table('settings', function (Blueprint $table) {
            $table->dropUnique('uq_settings_user');
        });

        Schema::table('grades', function (Blueprint $table) {
            $table->dropUnique('uq_grades_user_grade');
        });
    }
};
