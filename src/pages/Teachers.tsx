import { createSignal, onMount } from "solid-js";
import { invoke } from "@tauri-apps/api/core";

type Teacher = {
    id: number;
    first_name: string;
    last_name: string;
    profile_picture?: string;
    ders_id: number;
};

function Teachers() {
    const [teachers, setTeachers] = createSignal<Teacher[]>([]);
    const [loading, setLoading] = createSignal(true);

    const [newTeacher, setNewTeacher] = createSignal<{
        first_name: string;
        last_name: string;
        profile_picture?: File;
        ders_id: number;
    }>({ first_name: "", last_name: "", ders_id: 0 });

    const [adding, setAdding] = createSignal(false);
    const [editingId, setEditingId] = createSignal<number | null>(null);
    const [editTeacher, setEditTeacher] = createSignal<Partial<Teacher>>({});

    const [toastMsg, setToastMsg] = createSignal<string | null>(null);
    const [toastType, setToastType] = createSignal<"success" | "error">("success");

    const showToast = (msg: string, type: "success" | "error" = "success") => {
        setToastMsg(msg);
        setToastType(type);
        setTimeout(() => setToastMsg(null), 3000);
    };

    const fetchTeachers = async () => {
        setLoading(true);
        try {
            const data = await invoke("get_teachers");
            setTeachers(data as Teacher[]);
        } catch (err) {
            console.error(err);
            setTeachers([]);
            showToast("Müəllimləri gətirmək alınmadı!", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleAddTeacher = async (e: Event) => {
        e.preventDefault();
        if (!newTeacher().first_name.trim() || !newTeacher().last_name.trim()) return;

        setAdding(true);
        try {
            let profile_path: string | undefined = undefined;

            if (newTeacher().profile_picture) {
                const file = newTeacher().profile_picture;
                if (!file) return;
                const buffer = await file.arrayBuffer();
                // Uint8Array birbaşa göndər
                const uint8Buffer = new Uint8Array(buffer);

                if (!file) {
                    console.error("File is undefined");
                    return;
                };
                console.log(file)
                profile_path = await invoke<string>("upload_image", {
                    name: file.name,
                    buffer: uint8Buffer,  // Array.from yox
                });


                /* invalid args `fileName` for command `upload_image`: command upload_image missing required key fileName */
                console.log(`Profile path: ${profile_path}`);
            }

            await invoke("add_teacher", {
                firstname: newTeacher().first_name,
                lastname: newTeacher().last_name,
                profilepicture: profile_path,
                dersid: newTeacher().ders_id,
            });

            setNewTeacher({ first_name: "", last_name: "", ders_id: 0 });
            fetchTeachers();
            showToast("Müəllim əlavə olundu ✅", "success");
        } catch (err) {
            console.error(err);
            showToast("Müəllim əlavə olunmadı ❌", "error");
        } finally {
            setAdding(false);
        }
    };



    const handleDelete = async (id: number) => {
        if (!confirm("Bu müəllimi silmək istədiyinizə əminsiniz?")) return;
        try {
            await invoke("delete_teacher", { id });
            fetchTeachers();
            showToast("Müəllim silindi 🗑️", "success");
        } catch (err) {
            console.error(err);
            showToast("Müəllim silinmədi ❌", "error");
        }
    };

    const startEdit = (teacher: Teacher) => {
        setEditingId(teacher.id);
        setEditTeacher({ ...teacher });
    };

    const handleUpdate = async (e: Event) => {
        e.preventDefault();
        if (editingId() === null) return;
        try {
            await invoke("update_teacher", {
                id: editingId(),
                first_name: editTeacher().first_name,
                last_name: editTeacher().last_name,
                profile_picture: editTeacher().profile_picture,
                ders_id: editTeacher().ders_id,
            });
            setEditingId(null);
            setEditTeacher({});
            fetchTeachers();
            showToast("Müəllim güncəlləndi ✏️", "success");
        } catch (err) {
            console.error(err);
            showToast("Müəllim güncəllənmədi ❌", "error");
        }
    };

    onMount(() => {
        fetchTeachers();
    });

    return (
        <main class="container mx-auto p-6 relative">
            <h1 class="text-3xl font-bold mb-4">Müəllimlər</h1>

            {/* Müəllim əlavə formu */}
            <form onSubmit={handleAddTeacher} class="mb-6 flex flex-col sm:flex-row gap-2">
                <input
                    type="text"
                    placeholder="Ad"
                    class="input input-bordered flex-1"
                    value={newTeacher().first_name}
                    onInput={(e) =>
                        setNewTeacher({ ...newTeacher(), first_name: e.currentTarget.value })
                    }
                />
                <input
                    type="text"
                    placeholder="Soyad"
                    class="input input-bordered flex-1"
                    value={newTeacher().last_name}
                    onInput={(e) =>
                        setNewTeacher({ ...newTeacher(), last_name: e.currentTarget.value })
                    }
                />
                <input
                    type="file"
                    accept="image/*"
                    class="input flex-1"
                    onChange={(e) =>
                        setNewTeacher({ ...newTeacher(), profile_picture: e.currentTarget.files?.[0] })
                    }
                />
                <input
                    type="number"
                    placeholder="Dərs ID"
                    class="input input-bordered w-24"
                    value={newTeacher().ders_id}
                    onInput={(e) =>
                        setNewTeacher({ ...newTeacher(), ders_id: Number(e.currentTarget.value) })
                    }
                />
                <button type="submit" class="btn btn-primary" disabled={adding()}>
                    {adding() ? "Əlavə edilir..." : "Əlavə et"}
                </button>
            </form>

            {/* Müəllim cardları */}
            {loading() ? (
                <div class="flex items-center justify-center space-x-2">
                    <span class="loading loading-spinner loading-md"></span>
                    <span>Yüklənilir...</span>
                </div>
            ) : teachers().length === 0 ? (
                <p class="text-gray-500 text-center">Boş</p>
            ) : (
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {teachers().map((teacher) => (
                        <div class="card shadow-md p-4 flex flex-col items-center bg-white rounded-lg">
                            <img
                                
                                src={teacher.profile_picture ?? "/default-avatar.png"}
                                alt="Profile"
                                class="w-24 h-24 rounded-full mb-2 object-cover"
                            />
                            {editingId() === teacher.id ? (
                                <form onSubmit={handleUpdate} class="flex flex-col gap-2 w-full">
                                    <input
                                        type="text"
                                        value={editTeacher().first_name}
                                        onInput={(e) =>
                                            setEditTeacher({ ...editTeacher(), first_name: e.currentTarget.value })
                                        }
                                        class="input input-bordered"
                                    />
                                    <input
                                        type="text"
                                        value={editTeacher().last_name}
                                        onInput={(e) =>
                                            setEditTeacher({ ...editTeacher(), last_name: e.currentTarget.value })
                                        }
                                        class="input input-bordered"
                                    />
                                    <input
                                        type="number"
                                        value={editTeacher().ders_id}
                                        onInput={(e) =>
                                            setEditTeacher({ ...editTeacher(), ders_id: Number(e.currentTarget.value) })
                                        }
                                        class="input input-bordered"
                                    />
                                    <div class="flex gap-2 justify-center mt-2">
                                        <button type="submit" class="btn btn-success btn-sm">Kaydet</button>
                                        <button
                                            type="button"
                                            class="btn btn-ghost btn-sm"
                                            onClick={() => setEditingId(null)}
                                        >
                                            Vazgeç
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <>
                                    <h2 class="text-lg font-bold">{teacher.first_name} {teacher.last_name}</h2>
                                    <p class="text-gray-500">Dərs ID: {teacher.ders_id}</p>
                                    <div class="flex gap-2 mt-2">
                                        <button
                                            class="btn btn-warning btn-xs"
                                            onClick={() => startEdit(teacher)}
                                        >
                                            Düzenle
                                        </button>
                                        <button
                                            class="btn btn-error btn-xs"
                                            onClick={() => handleDelete(teacher.id)}
                                        >
                                            Sil
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Toast */}
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

export default Teachers;
