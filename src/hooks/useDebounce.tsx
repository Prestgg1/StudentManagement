// src/hooks/useDebounce.ts
import { createSignal, createEffect, onCleanup, Accessor } from "solid-js";

export function useDebounce<T>(value: Accessor<T>, delay = 500) {
  const [debouncedValue, setDebouncedValue] = createSignal(value());
  let timer: number | undefined;

  createEffect(() => {
    const v = value();
    clearTimeout(timer);
    timer = setTimeout(() => setDebouncedValue(v as any), delay);
  });

  onCleanup(() => clearTimeout(timer));

  return debouncedValue;
}
