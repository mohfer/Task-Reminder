import { create } from "zustand";
import { persist } from "zustand/middleware";

const useSemesterStore = create(
    persist(
        (set) => ({
            semester: "Semester 1",
            semesterLabel: "Semester 1",
            userName: '',
            setSemester: (semester, label) => set({ semester, semesterLabel: label }),
            setUserName: (name) => set({ userName: name }),
        }),
        {
            name: "semester-storage",
        }
    )
);

export default useSemesterStore;