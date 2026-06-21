"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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

const dayNames = ["S", "M", "T", "W", "T", "F", "S"];

export function CalendarPicker({ label, onChange, value }: CalendarPickerProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const selectedDate = value ? new Date(`${value}T12:00:00`) : null;
  const today = new Date();
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(
    selectedDate ?? new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const months = useMemo(
    () => [viewDate, new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1)],
    [viewDate],
  );
  const selectedLabel = selectedDate
    ? selectedDate.toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Choose a date";

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

  function moveMonth(offset: number) {
    setViewDate(
      (current) => new Date(current.getFullYear(), current.getMonth() + offset, 1),
    );
  }

  function selectDate(dateValue: string) {
    onChange(dateValue);
    setIsOpen(false);
  }

  return (
    <div className="relative">
      <p className="text-sm font-semibold text-neutral-800">{label}</p>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="mt-2 flex h-14 w-full items-center justify-between rounded-2xl border border-neutral-300 bg-white px-4 text-left text-sm font-semibold text-neutral-950 shadow-[0_10px_30px_rgba(20,20,20,0.04)] transition hover:-translate-y-0.5 hover:border-neutral-500 hover:shadow-[0_16px_40px_rgba(20,20,20,0.08)]"
      >
        <span>{selectedLabel}</span>
        <span className="text-neutral-400">Date</span>
      </button>

      {isOpen ? (
        <div
          ref={popoverRef}
          className="absolute left-0 top-[88px] z-50 w-[min(92vw,760px)] rounded-[30px] border border-neutral-200 bg-white p-5 shadow-[0_34px_120px_rgba(20,20,20,0.22)]"
        >
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => moveMonth(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-lg font-semibold transition hover:border-neutral-950"
            >
              {"<"}
            </button>
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                Select date
              </p>
              <p className="mt-1 text-lg font-semibold">
                {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
              </p>
            </div>
            <button
              type="button"
              onClick={() => moveMonth(1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-lg font-semibold transition hover:border-neutral-950"
            >
              {">"}
            </button>
          </div>

          <div className="mt-5 grid gap-6 md:grid-cols-2">
            {months.map((month, index) => (
              <MonthView
                key={`${month.getFullYear()}-${month.getMonth()}`}
                month={month}
                selectedValue={value}
                showOnMobile={index === 0}
                today={today}
                onSelect={selectDate}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MonthView({
  month,
  onSelect,
  selectedValue,
  showOnMobile,
  today,
}: {
  month: Date;
  onSelect: (value: string) => void;
  selectedValue: string;
  showOnMobile: boolean;
  today: Date;
}) {
  const days = useMemo(() => getCalendarDays(month), [month]);

  return (
    <div className={showOnMobile ? "" : "hidden md:block"}>
      <h3 className="text-center text-sm font-semibold text-neutral-950">
        {monthNames[month.getMonth()]} {month.getFullYear()}
      </h3>
      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-neutral-400">
        {dayNames.map((day, index) => (
          <span key={`${day}-${index}`}>{day}</span>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dateValue = toDateValue(day.date);
          const isSelected = selectedValue === dateValue;
          const isToday = toDateValue(today) === dateValue;
          const isCurrentMonth = day.date.getMonth() === month.getMonth();

          return (
            <button
              key={dateValue}
              type="button"
              onClick={() => onSelect(dateValue)}
              className={`relative aspect-square rounded-2xl text-sm font-semibold transition ${
                isSelected
                  ? "bg-neutral-950 text-white shadow-[0_10px_26px_rgba(20,20,20,0.22)]"
                  : isCurrentMonth
                    ? "text-neutral-900 hover:bg-neutral-100"
                    : "text-neutral-300 hover:bg-neutral-50"
              }`}
            >
              {day.date.getDate()}
              {isToday && !isSelected ? (
                <span className="absolute bottom-2 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#d94f48]" />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
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
