import { Subject } from "./subjects";

export type Student = {
    id: number;
    first_name: string;
    last_name: string;
    dersler: Subject[];
    debt: number;
  };