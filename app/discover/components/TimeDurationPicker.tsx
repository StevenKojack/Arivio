"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getEndTime, getHoursBetween } from "@/app/data/marketplace";

type TimeDurationPickerProps = {
  endTime: string;
  startTime: string;
  onEndTimeChange: (value: string) => void;
  onStartTimeChange: (value: string) => void;
};

const durationPresets = [
  { hours: 2, label: "2 hours" },
  { hours: 3, label: "3 hours" },
  { hours: 4, label: "4 hours" },
  { hours: 6, label: "6 hours" },
  { hours: 8, label: "All day" },
];

export function TimeDurationPicker({
  endTime,
  onEndTimeChange,
  onStartTimeChange,
  startTime,
}: TimeDurationPickerProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const durationHours = useMemo(
    () => getHoursBetween(startTime, endTime),
    [endTime, startTime],
  );

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (
        popoverRef.current &&
        event.target instanceof Node &&
        !popoverRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", closeOnOutsideClick);
    }

    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [isOpen]);

  function updateDuration(hours: number) {
    onEndTimeChange(getEndTime(startTime, hours));
  }

  return (
    <div className="relative">
      <p className="text-sm font-semibold text-neutral-800">Time</p>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="mt-2 flex h-14 w-full items-center justify-between rounded-2xl border border-neutral-300 bg-white px-4 text-left text-sm font-semibold text-neutral-950 shadow-[0_10px_30px_rgba(20,20,20,0.04)] transition hover:-translate-y-0.5 hover:border-neutral-500 hover:shadow-[0_16px_40px_rgba(20,20,20,0.08)]"
      >
        <span>
          {startTime} - {endTime}
        </span>
        <span className="rounded-full bg-[#f7f7f5] px-3 py-1 text-xs text-neutral-600">
          {durationHours} hr
        </span>
      </button>

      {isOpen ? (
        <div
          ref={popoverRef}
          className="absolute left-0 top-[88px] z-40 w-full max-w-xl rounded-[30px] border border-neutral-200 bg-white p-5 shadow-[0_34px_120px_rgba(20,20,20,0.2)]"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                Event time
              </p>
              <h3 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-950">
                {durationHours} hour plan
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold transition hover:border-neutral-950"
            >
              Done
            </button>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-semibold text-neutral-800">
              Start time
              <input
                type="time"
                value={startTime}
                onChange={(event) => {
                  onStartTimeChange(event.target.value);
                  onEndTimeChange(getEndTime(event.target.value, durationHours));
                }}
                className="mt-2 h-12 w-full rounded-2xl border border-neutral-300 px-4 text-sm font-semibold outline-none transition focus:border-neutral-950"
              />
            </label>
            <label className="text-sm font-semibold text-neutral-800">
              End time
              <input
                type="time"
                value={endTime}
                onChange={(event) => onEndTimeChange(event.target.value)}
                className="mt-2 h-12 w-full rounded-2xl border border-neutral-300 px-4 text-sm font-semibold outline-none transition focus:border-neutral-950"
              />
            </label>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {durationPresets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => updateDuration(preset.hours)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  Math.round(durationHours) === preset.hours
                    ? "bg-neutral-950 text-white"
                    : "border border-neutral-200 bg-white text-neutral-700 hover:border-neutral-950"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <label className="mt-5 block text-sm font-semibold text-neutral-800">
            Duration
            <input
              type="range"
              min="1"
              max="12"
              step="0.5"
              value={Math.min(Math.max(durationHours, 1), 12)}
              onChange={(event) => updateDuration(Number(event.target.value))}
              className="mt-3 w-full accent-neutral-950"
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}
