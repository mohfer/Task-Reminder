import { describe, it, expect, beforeEach } from 'vitest';
import useSemesterStore from './useSemesterStore';

describe('useSemesterStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useSemesterStore.setState({ semester: 'Semester 1', semesterLabel: 'Semester 1', userName: '' });
  });

  it('initial state', () => {
    const state = useSemesterStore.getState();
    expect(state.semester).toBe('Semester 1');
    expect(state.semesterLabel).toBe('Semester 1');
    expect(state.userName).toBe('');
  });

  it('setSemester mengupdate semester dan label', () => {
    const { setSemester } = useSemesterStore.getState();
    setSemester('Semester 3', 'Semester 3 - Ganjil');
    const state = useSemesterStore.getState();
    expect(state.semester).toBe('Semester 3');
    expect(state.semesterLabel).toBe('Semester 3 - Ganjil');
  });

  it('setUserName mengupdate userName', () => {
    const { setUserName } = useSemesterStore.getState();
    setUserName('Budi');
    expect(useSemesterStore.getState().userName).toBe('Budi');
  });

  it('persisten ke localStorage', () => {
    const { setSemester } = useSemesterStore.getState();
    setSemester('Semester 2', 'Semester 2');
    // zustand persist stores under key semester-storage
    const raw = localStorage.getItem('semester-storage');
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw);
    expect(parsed.state.semester).toBe('Semester 2');
  });

  it('handle ganti semester berkali-kali', () => {
    const { setSemester } = useSemesterStore.getState();
    setSemester('Semester 5', 'Semester 5');
    setSemester('Semester 6', 'Semester 6');
    expect(useSemesterStore.getState().semester).toBe('Semester 6');
  });

  it('setUserName kosong', () => {
    const { setUserName } = useSemesterStore.getState();
    setUserName('');
    expect(useSemesterStore.getState().userName).toBe('');
  });
});
