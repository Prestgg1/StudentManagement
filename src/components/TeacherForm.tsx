import { createSignal } from "solid-js";
import { uploadImage, addTeacher } from "../services/teacher_service";
import { Subject } from "../types/subjects";

export default function TeacherForm(props: { subjects:Subject[],   onAdded: () => void; showToast: (msg: string, type?: "success" | "error") => void }) {
  const [adding, setAdding] = createSignal(false);
  const [form, setForm] = createSignal<{ first_name: string; last_name: string; ders_id: number; profile_picture?: File }>({
    first_name: "",
    last_name: "",
    ders_id: 0,
  });

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!form().first_name.trim() || !form().last_name.trim()) return;

    setAdding(true);
    try {
      let profilePath: string | undefined;
      const file = form().profile_picture;
      if (file) {
        profilePath = await uploadImage(file);
      }

      await addTeacher({
        firstname: form().first_name,
        lastname: form().last_name,
        dersid: form().ders_id,
        profilepicture: profilePath,
      });

      setForm({ first_name: "", last_name: "", ders_id: 0 });
      props.onAdded();
      props.showToast("Müəllim əlavə olundu ✅");
    } catch (err) {
      console.error(err);
      props.showToast("Müəllim əlavə olunmadı ❌", "error");
    } finally {
      setAdding(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} class="mb-6 flex flex-col sm:flex-row gap-2">
      <input
        type="text"
        placeholder="Ad"
        class="input input-bordered flex-1"
        value={form().first_name}
        onInput={(e) => setForm({ ...form(), first_name: e.currentTarget.value })}
      />
      <input
        type="text"
        placeholder="Soyad"
        class="input input-bordered flex-1"
        value={form().last_name}
        onInput={(e) => setForm({ ...form(), last_name: e.currentTarget.value })}
      />
      <input
        type="file"
        accept="image/*"
        class="input flex-1"
        onChange={(e) => setForm({ ...form(), profile_picture: e.currentTarget.files?.[0] })}
      />

        <select
            class="input input-bordered mb-2"
            value={form().ders_id}
            onInput={(e) => setForm({ ...form(), ders_id: Number(e.currentTarget.value) })}
          >
            {props.subjects.map((s) => (
              <option value={s.id}>{s.name}</option>
            ))}
          </select>

      <button type="submit" class="btn btn-primary" disabled={adding()}>
        {adding() ? "Əlavə edilir..." : "Əlavə et"}
      </button>
    </form>
  );
}
