import { createSignal, createMemo } from "solid-js";
import EditModal from "../components/EditModal";

// Mock Data (sonradan backend gələcək)
const mockStudents = [
    {
        id: 1,
        firstName: "Ali",
        lastName: "Məmmədov",
        registrationDate: "2024-01-10",
        paymentDate: "2024-08-01",
        amount: 120,
        debt: 30,
        subjects: "Riyaziyyat, Fizika",
        paidMonths: ["2024-01", "2024-02", "2024-03", "2024-04", "2024-05"],
    },
    {
        id: 2,
        firstName: "Leyla",
        lastName: "Quliyeva",
        registrationDate: "2024-02-15",
        paymentDate: null,
        amount: 90,
        debt: 50,
        subjects: "Kimya, Biologiya",
        paidMonths: ["2024-01", "2024-03", "2024-04"],
    },
];

export default function Home() {
    const [search, setSearch] = createSignal("");

    // Axtarış Filter
    const filteredStudents = createMemo(() =>
        mockStudents.filter(
            (s) =>
                s.firstName.toLowerCase().includes(search().toLowerCase()) ||
                s.lastName.toLowerCase().includes(search().toLowerCase())
        )
    );

    return (
        <main class="p-6">
            {/* Başlıq */}
            <h1 class="text-2xl font-bold mb-4">📚 Qeydiyyatda olan şagirdlər</h1>

            {/* SearchBar */}
            <div class="mb-6 flex w-full max-w-lg">
                <input
                    type="text"
                    placeholder="Axtar..."
                    class="input input-bordered flex-1 rounded-r-none"
                    value={search()}
                    onInput={(e) => setSearch(e.currentTarget.value)}
                />
                <button class="btn btn-primary rounded-l-none">🔍</button>
            </div>

            {/* DataTable */}
            <div class="w-full overflow-x-auto shadow-lg rounded-lg">
                <table class="table min-w-[1000px]">
                    {/* Header */}
                    <thead class="bg-primary text-primary-content">
                        <tr>
                            <th>ID</th>
                            <th>Ad</th>
                            <th>Soyad</th>
                            <th>Qeydiyyat tarixi</th>
                            <th>Son ödəniş tarixi</th>
                            <th>Ödəniş məbləği</th>
                            <th>Borc</th>
                            <th>Ödənilən/Aylıq status</th>
                            <th>Fənlər</th>
                            <th>Əməliyyatlar</th>
                        </tr>
                    </thead>

                    {/* Body */}
                    <tbody>
                        {filteredStudents().map((student) => {
                            const now = new Date();
                            const months = Array.from({ length: 12 }, (_, i) => {
                                const date = new Date(now.getFullYear(), i, 1);
                                return `${date.getFullYear()}-${String(
                                    date.getMonth() + 1
                                ).padStart(2, "0")}`;
                            });

                            return (
                                <tr class="hover bg-orange-100 text-black">
                                    <td>{student.id}</td>
                                    <td>{student.firstName}</td>
                                    <td>{student.lastName}</td>
                                    <td>{student.registrationDate}</td>
                                    <td>{student.paymentDate ?? "-"}</td>
                                    <td class="font-bold">{student.amount} ₼</td>
                                    <td class="font-bold text-red-600">{student.debt} ₼</td>
                                    <td>
                                        <div class="flex flex-wrap gap-1">
                                            {months.map((m) => {
                                                const isPaid = student.paidMonths.includes(m);
                                                return (
                                                    <span
                                                        class={`px-2 py-1 text-xs rounded ${isPaid ? "bg-green-300" : "bg-red-300"
                                                            }`}
                                                    >
                                                        {m.split("-")[1]}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </td>
                                    <td>{student.subjects}</td>
                                    <td>
                                        <div class="flex flex-wrap gap-2">
                                            {/* The button to open modal */}
                                            <label for="edit_student_modal" class="btn btn-sm btn-info text-white">✏️ Düzəlt</label>

                                            {/* Put this part before </body> tag */}
                                            <EditModal student={student} onUpdated={() => { }} />


                                            <button class="btn btn-sm btn-error text-white">
                                                🗑 Sil
                                            </button>
                                            <button class="btn btn-sm btn-success text-white">
                                                💰 Ödəniş
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </main>
    );
}
