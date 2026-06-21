"use client";

import { getEndTime, getHoursBetween } from "@/app/data/marketplace";

type TimeDurationPickerProps = {
  endTime: string;
  onEndTimeChange: (value: string) => void;
  onStartTimeChange: (value: string) => void;
  startTime: string;
};

export function TimeDurationPicker({
  endTime,
  onEndTimeChange,
  onStartTimeChange,
  startTime,
}: TimeDurationPickerProps) {
  const duration = getHoursBetween(startTime, endTime);

  function updateDuration(hours: number) {
    onEndTimeChange(getEndTime(startTime, hours));
  }

  return (
    <div className="rounded-[24px] border border-neutral-200 bg-[#fbfbfa] p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TimeField label="Start time" onChange={onStartTimeChange} value={startTime} />
        <TimeField label="End time" onChange={onEndTimeChange} value={endTime} />
      </div>
      <div className="mt-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-neutral-800">Duration</p>
          <p className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-neutral-700">
            {duration} hours
          </p>
        </div>
        <input
          type="range"
          min="1"
          max="12"
          step="0.5"
          value={duration}
          onChange={(event) => updateDuration(Number(event.target.value))}
          className="mt-4 w-full accent-neutral-950"
        />
        <div className="mt-2 flex justify-between text-xs font-semibold text-neutral-400">
          <span>1 hr</span>
          <span>12 hrs</span>
        </div>
      </div>
    </div>
  );
}

function TimeField({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="text-sm font-semibold text-neutral-800">
      {label}
      <input
        type="time"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-12 w-full rounded-2xl border border-neutral-300 bg-white px-4 text-sm font-semibold outline-none transition focus:border-neutral-950"
      />
    </label>
  );
}
