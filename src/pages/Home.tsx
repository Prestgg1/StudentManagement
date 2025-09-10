import { createSignal, onMount } from "solid-js";
import { invoke } from "@tauri-apps/api/core"; // ✅ sənin istədiyin kimi
import { A } from "@solidjs/router";

function Home() {
    const [dersler, setDersler] = createSignal<Array<{ id: number; name: string }>>([]);
    const [loading, setLoading] = createSignal(true);

    const [newDersName, setNewDersName] = createSignal("");
    const [adding, setAdding] = createSignal(false);

    const [editingId, setEditingId] = createSignal<number | null>(null);
    const [editName, setEditName] = createSignal("");

    const [toastMsg, setToastMsg] = createSignal<string | null>(null);
    const [toastType, setToastType] = createSignal<"success" | "error">("success");

    // Toast helper
    const showToast = (msg: string, type: "success" | "error" = "success") => {
        setToastMsg(msg);
        setToastType(type);
        setTimeout(() => setToastMsg(null), 3000);
    };

    // Dersleri getir
    const fetchDersler = async () => {
        setLoading(true);
        try {
            const data = await invoke("get_dersler");
            setDersler(data as any);
        } catch (err) {
            console.error(err);
            setDersler([]);
            showToast("Dersləri gətirmək alınmadı!", "error");
        } finally {
            setLoading(false);
        }
    };

    // Yeni ders ekle
    const handleAddDers = async (e: Event) => {
        e.preventDefault();
        if (!newDersName().trim()) return;
        setAdding(true);
        try {
            await invoke("add_ders", { name: newDersName() });
            setNewDersName("");
            fetchDersler();
            showToast("Yeni dərs əlavə edildi ✅", "success");
        } catch (err) {
            console.error(err);
            showToast("Dərs əlavə olunmadı ❌", "error");
        } finally {
            setAdding(false);
        }
    };

    // Ders sil
    const handleDelete = async (id: number) => {
        if (!confirm("Bu dersi silmək istədiyinizə əminsinizmi?")) return;
        try {
            await invoke("delete_ders", { id });
            fetchDersler();
            showToast("Dərs silindi 🗑️", "success");
        } catch (err) {
            console.error(err);
            showToast("Dərs silinmədi ❌", "error");
        }
    };

    // Düzenleme başlat
    const startEdit = (ders: { id: number; name: string }) => {
        setEditingId(ders.id);
        setEditName(ders.name);
    };

    // Düzenleme kaydet
    const handleUpdate = async (e: Event) => {
        e.preventDefault();
        if (editingId() === null) return;
        try {
            await invoke("update_ders", { id: editingId(), newName: editName() });
            setEditingId(null);
            setEditName("");
            fetchDersler();
            showToast("Dərs güncəlləndi ✏️", "success");
        } catch (err) {
            console.error(err);
            showToast("Dərs güncəllənmədi ❌", "error");
        }
    };

    onMount(() => {
        fetchDersler();
    });

    return (
        <main class="container mx-auto p-6 relative">
            <h1 class="text-3xl font-bold mb-4">Dersler</h1>

            {/* Ders ekleme formu */}
            <form onSubmit={handleAddDers} class="mb-6 flex flex-col sm:flex-row gap-2">
                <input
                    type="text"
                    placeholder="Yeni ders adı..."
                    class="input input-bordered flex-1"
                    value={newDersName()}
                    onInput={(e) => setNewDersName(e.currentTarget.value)}
                />
                <button type="submit" class="btn btn-primary" disabled={adding()}>
                    {adding() ? "Əlavə edilir..." : "Əlavə et"}
                </button>
            </form>

            {/* Ders listesi */}
            <div class="bg-white shadow-md rounded-lg p-4">
                {loading() ? (
                    <div class="flex items-center justify-center space-x-2">
                        <span class="loading loading-spinner loading-md"></span>
                        <span>Yüklənilir...</span>
                    </div>
                ) : dersler().length === 0 ? (
                    <p class="text-gray-500 text-center">Boş</p>
                ) : (
                    <ul class="space-y-2">
                        {dersler().map((ders) => (
                            <li
                                class="border border-gray-200 rounded-lg p-3 flex justify-between items-center hover:bg-gray-50 text-black transition"
                            >
                                {editingId() === ders.id ? (
                                    <form onSubmit={handleUpdate} class="flex gap-2 w-full">
                                        <input
                                            type="text"
                                            class="input input-bordered flex-1"
                                            value={editName()}
                                            onInput={(e) => setEditName(e.currentTarget.value)}
                                        />
                                        <button type="submit" class="btn btn-success btn-sm">Kaydet</button>
                                        <button
                                            type="button"
                                            class="btn btn-ghost btn-sm"
                                            onClick={() => setEditingId(null)}
                                        >
                                            Vazgeç
                                        </button>
                                    </form>
                                ) : (
                                    <>
                                        <span>{ders.name}</span>
                                        <div class="flex gap-2">
                                            <button
                                                class="btn btn-warning btn-xs"
                                                onClick={


                                                    () => {
                                                        console.log(ders.id)
                                                        startEdit(ders)
                                                    }
                                                }
                                            >
                                                Düzenle
                                            </button>
                                            <button
                                                class="btn btn-error btn-xs"
                                                onClick={() => handleDelete(ders.id)}
                                            >
                                                Sil
                                            </button>
                                        </div>
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div class="mt-6">
                <button class="btn btn-secondary" onClick={() => fetchDersler()}>
                    Yenile
                </button>
            </div>

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

export default Home;
