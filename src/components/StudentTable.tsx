import { createSignal, onMount, Show, For } from "solid-js";
import { getSubjects } from "../services/subjects_service";
import type { Subject } from "../types/subjects";
import { deleteStudent, updateStudent } from "../services/student_service";
import { Student } from "../types/student";
import StudentForm from "../components/StudentForm";
import EditStudentModal from "../components/EditStudentModal";
import PaymentModal from "./PaymentModal";

type Props = {
  students: Student[];
  setStudents: (students: Student[]) => void;
  fetchStudents: () => Promise<void>;
  title?: string;
};

function StudentTable(props: Props) {
  const [subjects, setSubjects] = createSignal<Subject[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [toastMsg, setToastMsg] = createSignal<string | null>(null);
  const [toastType, setToastType] = createSignal<"success" | "error">("success");
  const [editingStudent, setEditingStudent] = createSignal<Student | null>(null);
  const [paymentStudent, setPaymentStudent] = createSignal<Student | null>(null);
  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const fetchSubjects = async () => {
    try {
      setSubjects(await getSubjects());
    } catch {
      showToast("Fənnləri gətirmək alınmadı!", "error");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bu tələbəni silmək istədiyinizə əminsiniz?")) return;
    try {
      await deleteStudent(id);
      await props.fetchStudents();
      showToast("Tələbə silindi 🗑️");
    } catch(e) {
      console.log(e)
      showToast("Silinmə zamanı xəta baş verdi ❌", "error");
    }
  };

  const handleSave = async (updated: Student) => {
    try {
      await updateStudent(updated);
      await props.fetchStudents();
      setEditingStudent(null);
      showToast("Tələbə yeniləndi ✅");
    } catch (e) {
      console.log(e)
      showToast("Yenilənmə zamanı xəta baş verdi ❌", "error");
    }
  };

  onMount(async () => {
    setLoading(true);
    await Promise.all([fetchSubjects(), props.fetchStudents()]);
    console.log(props.students)
    setLoading(false);
  });

  return (
    <main class="container mx-auto p-6 relative">
      <h1 class="text-3xl font-bold mb-4">{props.title || "Tələbələr"}</h1>

      <StudentForm subjects={subjects()} onAdded={props.fetchStudents} showToast={showToast} />

      <Show when={loading()} fallback={
        <table class="table w-full">
          <thead>
            <tr class="bg-base-200 text-sm">
              <th>ID</th>
              <th>Ad</th>
              <th>Soyad</th>
              <th>Fənnlər</th>
              <th>Yığılmış Borclar</th>
              <th>Əməliyyatlar</th>
            </tr>
          </thead>
          <tbody>
            <For each={props.students}>
              {(s) => (
                <tr class="hover">
                  <td>{s.id}</td>
                  <td>{s.first_name}</td>
                  <td>{s.last_name}</td>
                  <td>{s.dersler.map((d) => d.name).join(", ")}</td>
                  <td>{s.debt} AZN</td>
                  <td class="space-x-2">
                  
                  <button
  class="btn btn-sm btn-outline btn-success"
  onClick={() => setPaymentStudent(s)}
>
  Ödəniş
</button>

                    <button
                      class="btn btn-sm btn-outline btn-primary"
                      onClick={() => setEditingStudent(s)} // 🔹 Burada seçilən tələbəni yadda saxlayırıq
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
              )}
            </For>
          </tbody>
        </table>
      }>
        <div class="flex justify-center my-6">
          <span class="loading loading-spinner loading-lg"></span>
        </div>
      </Show>

      {/* 🔹 Yalnız bir modal */}
      <Show when={editingStudent()}>
        <EditStudentModal
          student={editingStudent()!}
          subjects={subjects()}
          onSave={handleSave}
          onClose={() => setEditingStudent(null)}
        />
      </Show>
      <Show when={paymentStudent()}>
        <PaymentModal
          student={paymentStudent()!}
          onClose={() => setPaymentStudent(null)}
          onPaid={() => props.fetchStudents()}
        />
      </Show>

      {toastMsg() && (
        <div class="toast toast-end z-50">
          <div class={`alert ${toastType() === "success" ? "alert-success" : "alert-error"}`}>
            <span>{toastMsg()}</span>
          </div>
        </div>
      )}
    </main>
  );
}

export default StudentTable;
