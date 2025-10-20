import { createSignal, onMount } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import { useToast } from "../hooks/useToast";

function Payments() {
  const [payments, setPayments] = createSignal<
    Array<{
      id: number;
      student_id: number;
      student_name: string;
      amount: number;
      date: string;  /* 2025-10-12-01 */
    }>
  >([]);
  const [loading, setLoading] = createSignal(true);

  const { toastMsg, toastType, showToast } = useToast();

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const data = await invoke("get_all_payments");
      setPayments(data as any);
      console.log(data);
    } catch (err) {
      console.error(err);
      setPayments([]);
      showToast("Ödənişləri gətirmək alınmadı!", "error");
    } finally {
      setLoading(false);
    }
  };

  function formatDateTime(dateStr: string) {
    if (!dateStr) return "-";
  
    // format: 2025-10-12-01 → parçalayırıq
    const parts = dateStr.split("-");
    if (parts.length < 4) return dateStr; // səhv format
  
    const [year, month, day, hour] = parts;
  
    // ISO formatına çeviririk ki, JS tanısın
    const isoString = `${year}-${month}-${day}T${hour.padStart(2, "0")}:00:00`;
    const dateObj = new Date(isoString);
  
    if (isNaN(dateObj.getTime())) return dateStr;
  
    // Tarix + saatı gözəl göstəririk (azərbaycan dilində)
    return dateObj.toLocaleString("az-AZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  
  onMount(() => {
    fetchPayments();
  });

  return (
    <main class="container mx-auto p-6 relative">
      <h1 class="text-3xl font-bold mb-4">Ödənişlər</h1>

      <div class="bg-white shadow-md rounded-lg p-4 overflow-x-auto">
        {loading() ? (
          <div class="flex items-center justify-center space-x-2 py-6">
            <span class="loading loading-spinner loading-md"></span>
            <span>Yüklənilir...</span>
          </div>
        ) : payments().length === 0 ? (
          <p class="text-gray-500 text-center">Hələ ödəniş yoxdur</p>
        ) : (
          <table class="table table-zebra w-full">
            <thead>
              <tr class="text-gray-700 bg-gray-100">
                <th class="py-3 px-4 text-left">#</th>
                <th class="py-3 px-4 text-left">Tələbə</th>
                <th class="py-3 px-4 text-left">Məbləğ (₼)</th>
                <th class="py-3 px-4 text-left">Tarix</th>
              </tr>
            </thead>
            <tbody>
              {payments().map((p, index) => (
                <tr class="hover:bg-gray-50 transition">
                  <td class="py-2 px-4 font-semibold text-gray-700">
                    {index + 1}
                  </td>
                  <td class="py-2 px-4">{p.student_name}</td>
                  <td class="py-2 px-4 text-green-600 font-medium">
                    {p.amount.toFixed(2)} ₼
                  </td>
                  <td class="py-2 px-4 text-gray-500">
                  {formatDateTime(p.date)}  
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div class="mt-6 flex justify-end">
        <button
          class="btn btn-secondary btn-sm"
          onClick={() => fetchPayments()}
        >
          Yenilə
        </button>
      </div>

      {toastMsg() && (
        <div class="toast toast-end z-50">
          <div
            class={`alert ${
              toastType() === "success" ? "alert-success" : "alert-error"
            }`}
          >
            <span>{toastMsg()}</span>
          </div>
        </div>
      )}
    </main>
  );
}

export default Payments;
