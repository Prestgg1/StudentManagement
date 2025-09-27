import { createSignal } from "solid-js";
import type { Teacher } from "../types/teacher";
import type { Subject } from "../types/subjects";
import { updateTeacher, deleteTeacher, uploadImage } from "../services/teacher_service";
import { useToast } from "../hooks/useToast";

export default function TeacherCard(props: {
  teacher: Teacher;
  subjects: Subject[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const [editing, setEditing] = createSignal(false);
  const [editData, setEditData] = createSignal<Partial<Teacher>>({ ...props.teacher });
  const [uploading, setUploading] = createSignal(false);
  const { showToast } = useToast();
  const handleSave = async () => {
    try {
      await updateTeacher(editData());
      setEditing(false);
      showToast("Müəllim güncəlləndi ✅", "success");
    } catch (err) {
      console.error(err);
      showToast("Müəllim güncəllənmədi ❌", "error");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bu müəllimi silmək istədiyinizə əminsiniz?")) return;
    try {
      await deleteTeacher(props.teacher.id);
      showToast("Müəllim silindi 🗑️", "success");
      props.onDelete(props.teacher.id);
    } catch (err) {
      console.error(err);
      props.onDelete(props.teacher.id);
      showToast("Müəllim silinmədi ❌", "error");
    }
  };

  const handleFileChange = async (e: Event) => {
    const target = e.currentTarget as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const path = await uploadImage(file);
      setEditData({ ...editData(), profile_picture: path });
    } catch (err) {
      console.error(err);
      showToast("Şəkil yüklənmədi ❌", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div class="card shadow-md p-4 flex flex-col items-center bg-white rounded-lg">
      <img
        src={editData().profile_picture ?? "/default-avatar.png"}
        alt="Profile"
        class="w-24 h-24 rounded-full mb-2 object-cover"
      />

      {editing() ? (
        <>
          <input
            type="text"
            class="input input-bordered w-full mb-2"
            value={editData().first_name}
            onInput={(e) => setEditData({ ...editData(), first_name: e.currentTarget.value })}
            placeholder="Ad"
          />
          <input
            type="text"
            class="input input-bordered w-full mb-2"
            value={editData().last_name}
            onInput={(e) => setEditData({ ...editData(), last_name: e.currentTarget.value })}
            placeholder="Soyad"
          />
          <select
            class="input input-bordered w-full mb-2"
            value={editData().ders_id}
            onInput={(e) => setEditData({ ...editData(), ders_id: Number(e.currentTarget.value) })}
          >
            {props.subjects.map((s) => (
              <option value={s.id}>{s.name}</option>
            ))}
          </select>
          <input
            type="file"
            accept="image/*"
            class="input w-full mb-2"
            onChange={handleFileChange}
          />
          <div class="flex gap-2">
            <button class="btn btn-success btn-sm" onClick={handleSave} disabled={uploading()}>
              {uploading() ? "Yüklənir..." : "Kaydet"}
            </button>
            <button class="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Vazgeç</button>
          </div>
        </>
      ) : (
        <>
          <h2 class="text-lg font-bold">{props.teacher.first_name} {props.teacher.last_name}</h2>
          <p class="text-gray-500">Dərs: {props.subjects.find(s => s.id === props.teacher.ders_id)?.name}</p>
          <div class="flex gap-2 mt-2">
            <button class="btn btn-warning btn-xs" onClick={() => setEditing(true)}>Düzenle</button>
            <button class="btn btn-error btn-xs" onClick={handleDelete}>Sil</button>
          </div>
        </>
      )}
    </div>
  );
}
