import { createSignal } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import { useParams } from "@solidjs/router";
import StudentTable from "../components/StudentTable";
import { Student } from "../types/student";

function ByDersStudents() {
  const params = useParams();
  const [students, setStudents] = createSignal<Student[]>([]);

  const fetchStudents = async () => {
    setStudents(await invoke("get_students_by_ders", { dersid: Number(params.id) }));
    console.log(students())
  };

  return <StudentTable title="Fənn üzrə tələbələr" fetchStudents={fetchStudents} />;
}

export default ByDersStudents;
