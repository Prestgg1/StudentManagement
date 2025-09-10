import { createSignal, onMount } from "solid-js";

interface Subject {
    id: number;
    name: string;
}

export default function EditModal({
    student,
    onUpdated,
}: {
    student: any;
    onUpdated: () => void;
}) {
    const [firstName, setFirstName] = createSignal(student.firstName || "");
    const [lastName, setLastName] = createSignal(student.lastName || "");
    const [subjects, setSubjects] = createSignal<Subject[]>([]);
    const [selectedSubjects, setSelectedSubjects] = createSignal<number[]>([]);

    // Simulyasiya olunmuş backend çağırışları
    const getAllSubjects = async (): Promise<Subject[]> => {
        return [
            { id: 1, name: "Riyaziyyat" },
            { id: 2, name: "Fizika" },
            { id: 3, name: "Kimya" },
        ];
    };

    const getSubjectsByStudentId = async (id: number): Promise<number[]> => {
        if (id === 1) return [1, 2];
        return [3];
    };

    onMount(async () => {
        const all = await getAllSubjects();
        const selected = await getSubjectsByStudentId(student.id);
        setSubjects(all);
        setSelectedSubjects(selected);
    });

    const toggleSubject = (id: number) => {
        if (selectedSubjects().includes(id)) {
            setSelectedSubjects(selectedSubjects().filter((s) => s !== id));
        } else {
            setSelectedSubjects([...selectedSubjects(), id]);
        }
    };

    const save = async () => {
        if (!firstName().trim() || !lastName().trim()) {
            alert("Ad və soyad boş ola bilməz!");
            return;
        }
        // burada backend-ə update göndərə bilərsən
        console.log("Yenilənmiş tələbə:", {
            id: student.id,
            firstName: firstName(),
            lastName: lastName(),
            subjects: selectedSubjects(),
        });

        onUpdated();
        (document.getElementById("edit_student_modal") as HTMLInputElement).checked =
            false;
    };

    return (
        <>
            {/* Toggle */}
            <input type="checkbox" id="edit_student_modal" class="modal-toggle" />

            {/* Modal */}
            <div class="modal" role="dialog">
                <div class="modal-box max-w-lg">
                    <h3 class="text-lg font-bold mb-4">Tələbəni yenilə</h3>

                    {/* Ad */}
                    <div class="form-control mb-3">
                        <label class="label">Ad</label>
                        <input
                            type="text"
                            class="input input-bordered"
                            value={firstName()}
                            onInput={(e) => setFirstName(e.currentTarget.value)}
                        />
                    </div>

                    {/* Soyad */}
                    <div class="form-control mb-3">
                        <label class="label">Soyad</label>
                        <input
                            type="text"
                            class="input input-bordered"
                            value={lastName()}
                            onInput={(e) => setLastName(e.currentTarget.value)}
                        />
                    </div>

                    {/* Fənnlər */}
                    <div class="mb-3">
                        <label class="font-bold block mb-2">Fənnlər</label>
                        <div class="flex flex-col gap-2 max-h-40 overflow-y-auto">
                            {subjects().map((sub) => (
                                <label class="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        class="checkbox checkbox-primary"
                                        checked={selectedSubjects().includes(sub.id)}
                                        onChange={() => toggleSubject(sub.id)}
                                    />
                                    <span>{sub.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div class="modal-action">
                        <label for="edit_student_modal" class="btn">
                            Ləğv et
                        </label>
                        <button type="button" class="btn btn-primary" onClick={save}>
                            Yadda saxla
                        </button>
                    </div>
                </div>
                <label class="modal-backdrop" for="edit_student_modal">
                    Close
                </label>
            </div>
        </>
    );
}
