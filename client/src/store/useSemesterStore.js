import { create } from "zustand";
import { persist } from "zustand/middleware";

const useSemesterStore = create(
    persist(
        (set) => ({
            semester: "Semester 1",
            semesterLabel: "Semester 1",
            setSemester: (semester, label) => set({ semester, semesterLabel: label }),
        }),
        {
            name: "semester-storage",
        }
    )
);

export default useSemesterStore;