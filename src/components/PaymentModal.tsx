import { createSignal, createEffect, onMount, Show } from "solid-js";
import { getStudentPayments, makePayment /* , getStudentPayments */ } from "../services/student_service";
import type { Student } from "../types/student";
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import type { ChartData, ChartDataset } from "chart.js";
import { Bar } from "solid-chartjs";
import { invoke } from "@tauri-apps/api/core";
import { Payment } from "../types/payment";

// Chart.js pluginlərini qeyd edirik
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type Props = {
  student: Student;
  onClose: () => void;
  onPaid: () => void;
};

export default function PaymentModal(props: Props) {
  // Reactive signals
  const [amount, setAmount] = createSignal<number>(0);
  const [loading, setLoading] = createSignal(false);
  const [selectedMonth, setSelectedMonth] = createSignal<string>("");
  const [error, setError] = createSignal<string | null>(null);
  const [payments, setPayments] = createSignal<{ month: string; paid: boolean; amount: number }[]>([]);
  const [chartData, setChartData] = createSignal<ChartData<"bar", number[], string>>({
    labels: [],
    datasets: [] as ChartDataset<"bar", number[]>[],
  });

  // Ödəniş funksiyası
  const handlePayment = async () => {
    if (!selectedMonth()) {
      setError("Ödəniş üçün ay seçin");
      return;
    }
    if (amount() <= 0) {
      setError("Məbləğ 0-dan böyük olmalıdır");
      return;
    }
  
    setLoading(true);
    setError(null);
  
    try {
      const today = selectedMonth() + "-01"; // Ayın 1-i olaraq təyin edə bilərik
      await makePayment(props.student.id, amount(), today);
      await loadPayments();  // Ödəniş sonrası chart yenilə
      props.onPaid();
    } catch (e) {
      setError("Ödəniş zamanı xəta baş verdi ❌");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Ödəniş məlumatlarını yükləyən funksiya
  const loadPayments = async () => {
    try {
   
      try {
       let req: any[] =  await invoke("get_student_payments", { studentid: props.student.id });
       req = req.map((payment: Payment) => ({
         month: payment.date,
         paid: payment.amount > 0,
         amount: payment.amount,
       })); 

       setPayments(req); 
      } catch (error) {
        console.error(error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Ödəniş chartını reactive signal ilə qururuq
  createEffect(() => {
    const data = payments();
    setChartData({
      labels: data.map(p => p.month),
      datasets: [
        {
          label: "Ödənilmiş məbləğ (AZN)",
          data: data.map(p => p.amount),
          backgroundColor: data.map(p => p.paid ? "#34D399" : "#F87171"),
        },
      ],
    });
  });

  // Modal mount olduqda ödənişləri yüklə
  onMount(() => loadPayments());

  // Chart options
  const chartOptions = {
    indexAxis: 'y' as const, // horizontal bar
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { beginAtZero: true },
      y: { ticks: { autoSkip: false } },
    },
  };

  return (
    <div class="modal modal-open">
      <div class="modal-box w-full max-w-3xl">
        <h2 class="text-xl font-bold mb-4">
          Ödəniş - {props.student.first_name} {props.student.last_name}
        </h2>

        {/* Ödəniş input */}
        <div class="form-control mb-4">
          <label class="label">Məbləğ (AZN)</label>
          <input
            type="number"
            min="0"
            class="input input-bordered"
            value={amount()}
            onInput={(e) => setAmount(parseInt(e.currentTarget.value))}
          />
        </div>
        <div class="form-control mb-4">
  <label class="label">Ödəniş ayı</label>
  <select class="select select-bordered" value={selectedMonth()} onChange={(e) => setSelectedMonth(e.currentTarget.value)}>
    <option disabled value="">Ay seçin</option>
    {payments().map(p => (
      <option value={p.month} disabled={p.paid}>{p.month} {p.paid ? "(Ödənilib)" : ""}</option>
    ))}
  </select>
</div>

        {/* Error mesajı */}
        {error() && <p class="text-red-500 mb-2">{error()}</p>}

        {/* Ödəniş və ləğv düymələri */}
        <div class="modal-action mb-4">
          <button class="btn btn-outline" onClick={props.onClose}>Ləğv et</button>
          <button class="btn btn-success" onClick={handlePayment} disabled={loading()}>
            {loading() ? "Yüklənir..." : "Ödəniş et"}
          </button>
        </div>

        {/* Chart */}
        <Show when={payments().length > 0}>
          <div class="mb-4">
            <h3 class="font-semibold mb-2">Ödəniş tarixi</h3>
            <div style="width: 100%; height: 300px;">
              <Bar data={chartData()} options={chartOptions} />
            </div>
          </div>
        </Show>
      </div>
    </div>
  );
}
