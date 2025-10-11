import { createSignal } from "solid-js";
import { getStudents } from "../services/student_service";
import StudentTable from "../components/StudentTable";
import { Student } from "../types/student";

function Students() {
  const [students, setStudents] = createSignal<Student[]>([]);

  const fetchStudents = async () => {
    setStudents(await getStudents());
  };

  return <StudentTable title="Bütün tələbələr" fetchStudents={fetchStudents} />;
}

export default Students;
