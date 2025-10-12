import { invoke } from "@tauri-apps/api/core";
import type { Student } from "../types/student";
import type { Payment } from "../types/payment";

export const getStudents = async (): Promise<Student[]> => {
  return (await invoke("get_students")) as Student[];
};

export const getStudentPayments = async (studentid: number) => {
  return (await invoke("get_student_payments", { studentid }));
};

export const searchStudent = async (search: string): Promise<Student[]> => {
  return (await invoke("search_student", { search })) as Student[];
};

export const makePayment = async (studentid: number, amount: number, date: string): Promise<void> => {
  return await invoke("make_payment", { studentid, amount, date });
};

export const addStudent = async (student: {
  firstname: string;
  lastname: string;
}) => {
  return await invoke("add_student", student);
};
export const updateStudent = async (student: Partial<Student>) => {
  return await invoke("update_student", {
    studentid: student.id,
    firstname: student.first_name,
    lastname: student.last_name,
    dersler: student.dersler,
  });
};

export const deleteStudent = async (id: number) => {
  return await invoke("delete_student", { studentid:id });
};
