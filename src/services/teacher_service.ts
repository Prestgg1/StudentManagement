import { invoke } from "@tauri-apps/api/core";
import type { Teacher } from "../types/teacher";

export const getTeachers = async (): Promise<Teacher[]> => {
  return (await invoke("get_teachers")) as Teacher[];
};

export const addTeacher = async (teacher: {
  firstname: string;
  lastname: string;
  profilepicture?: string;
  dersid: number;
}) => {
  return await invoke("add_teacher", teacher);
};

export const updateTeacher = async (teacher: Partial<Teacher>) => {
  return await invoke("update_teacher", {
    id: teacher.id,
    firstname: teacher.first_name,
    lastname: teacher.last_name,
    profilepicture: teacher.profile_picture,
    dersid: teacher.ders_id,
  });
};

export const deleteTeacher = async (id: number) => {
  return await invoke("delete_teacher", { id });
};

export const uploadImage = async (file: File) => {
  const buffer = await file.arrayBuffer();
  return await invoke<string>("upload_image", {
    name: file.name,
    buffer: new Uint8Array(buffer),
  });
};