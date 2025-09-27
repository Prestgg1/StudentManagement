import { createSignal } from "solid-js";

export type ToastType = "success" | "error";

export function useToast() {
  const [toastMsg, setToastMsg] = createSignal<string | null>(null);
  const [toastType, setToastType] = createSignal<ToastType>("success");

  const showToast = (msg: string, type: ToastType = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(null), 3000);
  };

  return { toastMsg, toastType, showToast };
}
