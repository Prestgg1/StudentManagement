import { createSignal, createEffect } from "solid-js";
import { getStudents, searchStudent } from "../services/student_service";
import StudentTable from "../components/StudentTable";
import { Student } from "../types/student";
import { useDebounce } from "../hooks/useDebounce";

function Students() {
  const [students, setStudents] = createSignal<Student[]>([]);
  const [search, setSearch] = createSignal("");
  const [loading, setLoading] = createSignal(false); // 🔹 Yüklənmə vəziyyəti
  const debouncedSearch = useDebounce(search, 500);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await getStudents();
      setStudents(data);
    } finally {
      setLoading(false);
    }
  };

  createEffect(() => {
    const query = debouncedSearch();
  
    (async () => {
      setLoading(true);
      try {
        if (query.trim().length > 0) {
          const results = await searchStudent(query);
          setStudents(results);
        } else {
          const all = await getStudents();
          setStudents(all);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  });
  return (
    <main class="p-6">
      <h1 class="text-2xl font-bold mb-4">Bütün tələbələr</h1>

      <div class="form-control mb-4">
        <input
          type="text"
          class="input input-bordered w-full max-w-sm"
          placeholder="Tələbə axtar..."
          value={search()}
          onInput={(e) => setSearch(e.currentTarget.value)}
        />
      </div>
    
        <StudentTable
        title="Tələbələr"
        setStudents={setStudents}
        students={students()}
        fetchStudents={fetchStudents}
      />

    </main>
  );
}

export default Students;
