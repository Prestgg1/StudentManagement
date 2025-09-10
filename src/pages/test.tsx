import { createSignal, createEffect, onMount } from "solid-js";
import { invoke } from "@tauri-apps/api/core";

import { A } from "@solidjs/router";

/* TypeError: can't access property "invoke", window.__TAURI_INTERNALS__ is undefined */

function Home() {
    const [dersler, setDersler] = createSignal<Array<{ id: number; name: string }>>([]);
    const [loading, setLoading] = createSignal(true);

    // Dersleri getir
    const fetchDersler = async () => {
        setLoading(true);
        try {
            const test = await invoke("greet", { name: "Solid" });
            console.log(test);
            /*    const data = await invoke("get_dersler");
               setDersler(data as any); */
        } catch (err) {
            console.error(err);
            setDersler([]);
        } finally {
            setLoading(false);
        }
    };

    onMount(() => {
        fetchDersler();
    });

    return (
        <main class="container mx-auto p-6">
            <h1 class="text-3xl font-bold mb-4">Dersler</h1>

            {/*      <div class="bg-white shadow-md rounded-lg p-4">
                {loading() ? (
                    <div class="flex items-center justify-center space-x-2">
                        <span class="loading loading-spinner loading-md"></span>
                        <span>Yükleniyor...</span>
                    </div>
                ) : dersler().length === 0 ? (
                    <p class="text-gray-500 text-center">Boş</p>
                ) : (
                    <ul class="space-y-2">
                        {dersler().map((ders) => (
                            <li
                                class="border border-gray-200 rounded-lg p-3 flex justify-between items-center hover:bg-gray-50 transition"
                            >
                                <span>{ders.name}</span>
                                <span class="badge badge-primary">ID: {ders.id}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div class="mt-6">
                <button
                    class="btn btn-primary"
                    onClick={() => {
                        fetchDersler();
                    }}
                >
                    Yenile
                </button>
            </div> */}
        </main>
    );
}

export default Home;
