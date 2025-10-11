import { invoke } from "@tauri-apps/api/core";
import type { Student } from "../types/student";

export const getStudents = async (): Promise<Student[]> => {
  return (await invoke("get_students")) as Student[];
};

export const addStudent = async (student: {
  firstname: string;
  lastname: string;
}) => {
  return await invoke("add_student", student);
};
export const updateStudent = async (student: Partial<Student>) => {
  return await invoke("update_student", {
    id: student.id,
    firstname: student.first_name,
    lastname: student.last_name,
  });
};

export const deleteStudent = async (id: number) => {
  return await invoke("delete_student", { id });
};
