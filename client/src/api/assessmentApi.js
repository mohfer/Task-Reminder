import axiosInstance from './axiosInstance';

export const assessmentApi = {
    calculate: (semester) =>
        axiosInstance.get('/assessments/calculate', { params: { semester } }),

    update: (id, data) => axiosInstance.patch(`/assessments/${id}`, data),

    sync: (targetSemester, sourceSemester) =>
        axiosInstance.post('/assessments/sync', { semester: targetSemester, source_semester: sourceSemester }),

    getSemesters: () =>
        axiosInstance.get('/assessments/semesters'),
};
