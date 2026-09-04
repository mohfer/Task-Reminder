import { describe, it, expect } from 'vitest';
import { getFieldError } from './formUtils';

describe('getFieldError', () => {
  it('return null jika errors falsy', () => {
    expect(getFieldError(null, 'name')).toBeNull();
    expect(getFieldError(undefined, 'name')).toBeNull();
    expect(getFieldError({}, 'name')).toBeNull();
  });

  it('return string error langsung', () => {
    expect(getFieldError({ name: 'Wajib diisi' }, 'name')).toBe('Wajib diisi');
  });

  it('return elemen pertama jika array', () => {
    expect(getFieldError({ email: ['Email tidak valid', 'Lain'] }, 'email')).toBe('Email tidak valid');
  });

  it('return null jika field tidak ada', () => {
    expect(getFieldError({ name: 'error' }, 'email')).toBeNull();
  });

  it('handle array kosong', () => {
    expect(getFieldError({ name: [] }, 'name')).toBeUndefined();
  });

  it('handle field dengan string kosong', () => {
    expect(getFieldError({ name: '' }, 'name')).toBeNull();
  });
});
