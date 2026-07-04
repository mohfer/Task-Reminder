<?php

use App\Models\Grade;
use App\Models\User;
use App\Services\GradeService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(Tests\TestCase::class, RefreshDatabase::class);

beforeEach(function () {
    $this->service = new GradeService();
    $this->user = User::factory()->create();
});

// ─── getAll ───

test('getAll returns grades ordered by grade rank', function () {
    Grade::insert([
        ['grade' => 'C', 'grade_point' => 2.00, 'minimal_score' => 56, 'maximal_score' => 59.99, 'user_id' => $this->user->id],
        ['grade' => 'A', 'grade_point' => 4.00, 'minimal_score' => 85, 'maximal_score' => 100, 'user_id' => $this->user->id],
        ['grade' => 'B', 'grade_point' => 3.00, 'minimal_score' => 70, 'maximal_score' => 74.99, 'user_id' => $this->user->id],
    ]);

    $grades = $this->service->getAll($this->user->id);

    expect($grades)->toHaveCount(3);
    expect($grades[0]['grade'])->toBe('A'); // A comes first in the custom order
    expect($grades[1]['grade'])->toBe('B');
    expect($grades[2]['grade'])->toBe('C');
});

test('getAll formats decimal numbers correctly', function () {
    Grade::create([
        'grade' => 'A-', 'grade_point' => 3.75, 'minimal_score' => 80, 'maximal_score' => 84.99,
        'user_id' => $this->user->id,
    ]);

    $grades = $this->service->getAll($this->user->id);

    expect($grades[0]['grade_point'])->toBe('3.75');
    expect($grades[0]['minimal_score'])->toBe('80.00');
});

test('getAll returns empty for user with no grades', function () {
    expect($this->service->getAll($this->user->id))->toBeEmpty();
});

// ─── create ───

test('create adds a new grade for user', function () {
    $grade = $this->service->create($this->user->id, [
        'grade' => 'A', 'grade_point' => 4.00, 'minimal_score' => 85, 'maximal_score' => 100,
    ]);

    expect($grade->grade)->toBe('A');
    expect($grade->grade_point)->toBe(4.00);
    expect($grade->user_id)->toBe($this->user->id);
});

// ─── update ───

test('update modifies grade owned by user', function () {
    $grade = Grade::create([
        'grade' => 'B', 'grade_point' => 3.00, 'minimal_score' => 70, 'maximal_score' => 74.99,
        'user_id' => $this->user->id,
    ]);

    $updated = $this->service->update($this->user->id, $grade->id, [
        'grade' => 'B+', 'grade_point' => 3.50, 'minimal_score' => 75, 'maximal_score' => 79.99,
    ]);

    expect($updated->grade)->toBe('B+');
});

test('update throws for another user grade', function () {
    $otherUser = User::factory()->create();
    $grade = Grade::create([
        'grade' => 'A', 'grade_point' => 4.00, 'minimal_score' => 85, 'maximal_score' => 100,
        'user_id' => $otherUser->id,
    ]);

    $this->service->update($this->user->id, $grade->id, [
        'grade' => 'Hijack', 'grade_point' => 1, 'minimal_score' => 0, 'maximal_score' => 10,
    ]);
})->throws(\Illuminate\Database\Eloquent\ModelNotFoundException::class);

// ─── delete ───

test('delete removes grade owned by user', function () {
    $grade = Grade::create([
        'grade' => 'A', 'grade_point' => 4.00, 'minimal_score' => 85, 'maximal_score' => 100,
        'user_id' => $this->user->id,
    ]);

    $this->service->delete($this->user->id, $grade->id);

    expect(Grade::find($grade->id))->toBeNull();
});

test('delete throws for another user grade', function () {
    $otherUser = User::factory()->create();
    $grade = Grade::create([
        'grade' => 'A', 'grade_point' => 4.00, 'minimal_score' => 85, 'maximal_score' => 100,
        'user_id' => $otherUser->id,
    ]);

    $this->service->delete($this->user->id, $grade->id);
})->throws(\Illuminate\Database\Eloquent\ModelNotFoundException::class);
