"use client";

import { useMemo, useState } from "react";

type CalendarPickerProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarPicker({ label, onChange, value }: CalendarPickerProps) {
  const selectedDate = value ? new Date(`${value}T12:00:00`) : null;
  const today = new Date();
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(
    selectedDate ?? new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const days = useMemo(() => getCalendarDays(viewDate), [viewDate]);
  const selectedLabel = selectedDate
    ? selectedDate.toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Choose a date";

  function moveMonth(offset: number) {
    setViewDate(
      (current) => new Date(current.getFullYear(), current.getMonth() + offset, 1),
    );
  }

  function moveYear(offset: number) {
    setViewDate(
      (current) => new Date(current.getFullYear() + offset, current.getMonth(), 1),
    );
  }

  return (
    <div>
      <p className="text-sm font-semibold text-neutral-800">{label}</p>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="mt-2 flex h-14 w-full items-center justify-between rounded-2xl border border-neutral-300 bg-white px-4 text-left text-sm font-semibold text-neutral-950 shadow-[0_10px_30px_rgba(20,20,20,0.04)] transition hover:border-neutral-500"
      >
        <span>{selectedLabel}</span>
        <span className="text-neutral-400">Calendar</span>
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-neutral-950/30 p-4 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-lg rounded-[28px] bg-white p-5 shadow-[0_34px_120px_rgba(20,20,20,0.24)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                  Select date
                </p>
                <h3 className="mt-1 text-2xl font-semibold tracking-tight">
                  {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="h-10 rounded-full border border-neutral-200 px-4 text-sm font-semibold"
              >
                Close
              </button>
            </div>

            <div className="mt-5 grid grid-cols-4 gap-2">
              <CalendarNavButton label="- Year" onClick={() => moveYear(-1)} />
              <CalendarNavButton label="- Month" onClick={() => moveMonth(-1)} />
              <CalendarNavButton label="+ Month" onClick={() => moveMonth(1)} />
              <CalendarNavButton label="+ Year" onClick={() => moveYear(1)} />
            </div>

            <div className="mt-5 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-neutral-500">
              {dayNames.map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>

            <div className="mt-2 grid grid-cols-7 gap-1">
              {days.map((day) => {
                const dateValue = toDateValue(day.date);
                const isSelected = value === dateValue;
                const isCurrentMonth = day.date.getMonth() === viewDate.getMonth();

                return (
                  <button
                    key={dateValue}
                    type="button"
                    onClick={() => {
                      onChange(dateValue);
                      setIsOpen(false);
                    }}
                    className={`aspect-square rounded-2xl text-sm font-semibold transition ${
                      isSelected
                        ? "bg-neutral-950 text-white shadow-[0_10px_26px_rgba(20,20,20,0.22)]"
                        : isCurrentMonth
                          ? "text-neutral-900 hover:bg-neutral-100"
                          : "text-neutral-300 hover:bg-neutral-50"
                    }`}
                  >
                    {day.date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CalendarNavButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-10 rounded-full border border-neutral-200 text-xs font-semibold text-neutral-700 transition hover:border-neutral-950 hover:text-neutral-950"
    >
      {label}
    </button>
  );
}

function getCalendarDays(viewDate: Date) {
  const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return { date };
  });
}

function toDateValue(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}
