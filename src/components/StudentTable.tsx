import { createSignal, onMount } from "solid-js";
import { getSubjects } from "../services/subjects_service";
import type { Subject } from "../types/subjects";
import { deleteStudent } from "../services/student_service";
import { Student } from "../types/student";
import StudentForm from "../components/StudentForm";

type Props = {
  fetchStudents: () => Promise<void>; // fərqli səhifələrdən gələcək funksiyalar
  title?: string;
};

function StudentTable(props: Props) {
  const [students, setStudents] = createSignal<Student[]>([]);
  const [subjects, setSubjects] = createSignal<Subject[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [toastMsg, setToastMsg] = createSignal<string | null>(null);
  const [toastType, setToastType] = createSignal<"success" | "error">("success");

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const fetchSubjects = async () => {
    try {
      setSubjects(await getSubjects());
    } catch (err) {
      console.error(err);
      showToast("Fənnləri gətirmək alınmadı!", "error");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bu tələbəni silmək istədiyinizə əminsiniz?")) return;
    try {
      await deleteStudent(id);
      await props.fetchStudents();
      showToast("Tələbə silindi 🗑️", "success");
    } catch (err) {
      console.error(err);
      showToast("Silinmə zamanı xəta baş verdi ❌", "error");
    }
  };

  // Komponent mount olunanda həm fənnləri, həm tələbələri gətir
  onMount(async () => {
    setLoading(true);
    await Promise.all([fetchSubjects(), props.fetchStudents()]);
    setLoading(false);
  });

  return (
    <main class="container mx-auto p-6 relative">
      <h1 class="text-3xl font-bold mb-4">{props.title || "Tələbələr"}</h1>

      <StudentForm subjects={subjects()} onAdded={props.fetchStudents} showToast={showToast} />

      {loading() ? (
        <div class="flex items-center justify-center space-x-2">
          <span class="loading loading-spinner loading-md"></span>
          <span>Yüklənilir...</span>
        </div>
      ) : students().length === 0 ? (
        <p class="text-gray-500 text-center">Boş</p>
      ) : (
        <table class="table w-full">
          <thead>
            <tr class="bg-base-200 text-sm">
              <th>ID</th>
              <th>Ad</th>
              <th>Soyad</th>
              <th>Fənn</th>
              <th>Əməliyyatlar</th>
            </tr>
          </thead>
          <tbody>
            {students().map((s) => (
              <tr class="hover">
                <td>{s.id}</td>
                <td>{s.first_name}</td>
                <td>{s.last_name}</td>
                <td></td>
                <td class="space-x-2">
                  <button
                    class="btn btn-sm btn-outline btn-primary"
                    onClick={() => console.log("Edit", s.id)}
                  >
                    Dəyiş
                  </button>
                  <button
                    class="btn btn-sm btn-outline btn-error"
                    onClick={() => handleDelete(s.id)}
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {toastMsg() && (
        <div class="toast toast-end z-50">
          <div
            class={`alert ${toastType() === "success" ? "alert-success" : "alert-error"}`}
          >
            <span>{toastMsg()}</span>
          </div>
        </div>
      )}
    </main>
  );
}

export default StudentTable;
