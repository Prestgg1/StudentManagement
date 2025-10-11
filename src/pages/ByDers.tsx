import { createSignal, onMount } from "solid-js";
import TeacherForm from "../components/TeacherForm";
import TeacherCard from "../components/TeacherCard";
import { getTeachers, deleteTeacher } from "../services/teacher_service";
import type { Teacher } from "../types/teacher";
import { getSubjects } from "../services/subjects_service";
import type { Subject } from "../types/subjects";
import { useParams } from "@solidjs/router";
import { invoke } from "@tauri-apps/api/core";

function ByDersTeachers() {
    const params = useParams();
  const [teachers, setTeachers] = createSignal<Teacher[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [toastMsg, setToastMsg] = createSignal<string | null>(null);
  const [toastType, setToastType] = createSignal<"success" | "error">("success");
  const [subjects, setSubjects] = createSignal<Subject[]>([]);
  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      setSubjects(await getSubjects());
    } catch (err) {
      console.error(err);
      setSubjects([]);
      showToast("Müəllimləri gətirmək alınmadı!", "error");
    } finally {
      setLoading(false);
    }
  };
  const fetchTeachers = async () => {
    setLoading(true);
    try {
      setTeachers(await invoke("get_teachers_by_ders", { dersid: Number(params.id) }));
    } catch (err) {
      console.error(err);
      setTeachers([]);
      showToast("Müəllimləri gətirmək alınmadı!", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bu müəllimi silmək istədiyinizə əminsiniz?")) return;
    try {
      await deleteTeacher(id);
      fetchTeachers();
      showToast("Müəllim silindi 🗑️", "success");
    } catch (err) {
      console.error(err);
      showToast("Müəllim silinmədi ❌", "error");
    }
  };

  onMount(() => Promise.all([fetchTeachers(), fetchSubjects()]).then(() => setLoading(false)));

  return (
    <main class="container mx-auto p-6 relative">
      <h1 class="text-3xl font-bold mb-4">Müəllimlər</h1>
      <TeacherForm subjects={subjects()} onAdded={fetchTeachers} showToast={showToast} />
      {loading() ? (
        <div class="flex items-center justify-center space-x-2">
          <span class="loading loading-spinner loading-md"></span>
          <span>Yüklənilir...</span>
        </div>
      ) : teachers().length === 0 ? (
        <p class="text-gray-500 text-center">Boş</p>
      ) : (
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {teachers().map((t) => (
            <TeacherCard
              subjects={subjects()}
              teacher={t}
              onEdit={() => console.log("Edit", t.id)}
              onDelete={() => handleDelete(t.id)}
            />
          ))}
        </div>
      )}
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

export default ByDersTeachers;
