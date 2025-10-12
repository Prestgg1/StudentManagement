import { createSignal, onMount, onCleanup, For, Show } from "solid-js";
import type { Student } from "../types/student";
import type { Subject } from "../types/subjects";

type Props = {
  student: Student;
  subjects: Subject[];
  onSave: (updated: Student) => Promise<void>;
  onClose: () => void;
};

export default function EditStudentModal(props: Props) {
  const [firstName, setFirstName] = createSignal(props.student.first_name);
  const [lastName, setLastName] = createSignal(props.student.last_name);
  const [selectedSubjects, setSelectedSubjects] = createSignal<Subject[]>([...props.student.dersler]);

  const handleEsc = (e: KeyboardEvent) => {
    if (e.key === "Escape") props.onClose();
  };
  onMount(() => document.addEventListener("keydown", handleEsc));
  onCleanup(() => document.removeEventListener("keydown", handleEsc));

  const toggleSubject = (subject: Subject) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject)
        ? prev.filter((s) => s !== subject)
        : [...prev, subject]
    );
  };

  const handleSave = async () => {
    await props.onSave({
      ...props.student,
      first_name: firstName(),
      last_name: lastName(),
      dersler: selectedSubjects(),
    });
  };

  return (
    <div
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-opacity animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) props.onClose();
      }}
    >
      <div class="bg-base-100 p-6 rounded-2xl shadow-xl w-full max-w-lg animate-slideUp">
        <h3 class="font-bold text-lg mb-4">Tələbəni Dəyiş</h3>

        <div class="form-control mb-3">
          <label class="label">Ad</label>
          <input
            type="text"
            class="input input-bordered w-full"
            value={firstName()}
            onInput={(e) => setFirstName(e.currentTarget.value)}
          />
        </div>

        <div class="form-control mb-3">
          <label class="label">Soyad</label>
          <input
            type="text"
            class="input input-bordered w-full"
            value={lastName()}
            onInput={(e) => setLastName(e.currentTarget.value)}
          />
        </div>

        <div class="form-control mb-3">
          <label class="label">Fənnlər</label>
          <div class="flex flex-wrap gap-2">
            <For each={props.subjects}>
              {(subj) => (
                <label class="cursor-pointer flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedSubjects().includes(subj)}
                    onChange={() => toggleSubject(subj)}
                    class="checkbox checkbox-primary"
                  />
                  <span>{subj.name}</span>
                </label>
              )}
            </For>
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <button class="btn btn-outline" onClick={props.onClose}>
            Bağla
          </button>
          <button class="btn btn-primary" onClick={handleSave}>
            Yadda saxla
          </button>
        </div>
      </div>
    </div>
  );
}
