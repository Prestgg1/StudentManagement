import { Subject } from "../types/subjects";
import { invoke } from "@tauri-apps/api/core";

export const getSubjects = async (): Promise<Subject[]> => {
    return (await invoke("get_dersler")) as Subject[];
};