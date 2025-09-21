'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

interface DateTimePickerProps {
  value?: string; // format: YYYY-MM-DD HH:mm:ss or ''
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

function pad2(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function formatServer(dt: Date) {
  const y = dt.getFullYear();
  const m = pad2(dt.getMonth() + 1);
  const d = pad2(dt.getDate());
  const hh = pad2(dt.getHours());
  const mm = pad2(dt.getMinutes());
  const ss = pad2(dt.getSeconds());
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
}

function parseToDate(value?: string): Date | null {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) {
    const [datePart, timePart] = value.split(' ');
    const [y, m, d] = datePart.split('-').map(Number);
    const [hh, mm, ss] = timePart.split(':').map(Number);
    const dt = new Date();
    dt.setFullYear(y);
    dt.setMonth(m - 1);
    dt.setDate(d);
    dt.setHours(hh, mm, ss, 0);
    return dt;
  }
  if (value.includes('T')) {
    const dt = new Date(value.replace('T', ' '));
    if (!isNaN(dt.getTime())) return dt;
  }
  const dt = new Date(value);
  return isNaN(dt.getTime()) ? null : dt;
}

export default function DateTimePicker({ value = '', onChange, placeholder = 'YYYY-MM-DD HH:mm:ss', className = '' }: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const initialDate = useMemo(() => parseToDate(value) || new Date(), [value]);
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth()); // 0-11
  const [selDate, setSelDate] = useState<Date>(initialDate);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  useEffect(() => {
    const d = parseToDate(value);
    if (d) {
      setSelDate(d);
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }, [value]);

  const daysMatrix = useMemo(() => {
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const startWeekDay = firstOfMonth.getDay(); // 0-6, Sun-Sat
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

    const cells: { day: number; inMonth: boolean }[] = [];
    // leading from prev month
    for (let i = 0; i < startWeekDay; i++) {
      cells.push({ day: prevMonthDays - startWeekDay + 1 + i, inMonth: false });
    }
    // current month
    for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, inMonth: true });
    // trailing to fill 42 cells
    while (cells.length < 42) cells.push({ day: cells.length - (startWeekDay + daysInMonth) + 1, inMonth: false });
    return cells;
  }, [viewYear, viewMonth]);

  const commitChange = (d: Date) => {
    onChange?.(formatServer(d));
    setOpen(false);
  };

  const onSelectDay = (cell: { day: number; inMonth: boolean }, idx: number) => {
    const monthOffset = cell.inMonth ? 0 : (idx < 7 && cell.day > 7 ? -1 : 1);
    const d = new Date(selDate);
    d.setFullYear(viewYear);
    d.setMonth(viewMonth + monthOffset);
    d.setDate(cell.day);
    setSelDate(d);
  };

  const onTimeChange = (part: 'h' | 'm' | 's', val: number) => {
    const d = new Date(selDate);
    const h = part === 'h' ? val : d.getHours();
    const m = part === 'm' ? val : d.getMinutes();
    const s = part === 's' ? val : d.getSeconds();
    d.setHours(h, m, s, 0);
    setSelDate(d);
  };

  const isSameDay = (a: Date, y: number, m: number, d: number) => a.getFullYear() === y && a.getMonth() === m && a.getDate() === d;

  return (
    <div className={className} ref={containerRef}>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="truncate text-left">
              {value || placeholder}
            </span>
            <i className="ri-calendar-line text-gray-500"></i>
          </div>
        </button>

        {open && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-2 w-[280px] md:w-[320px] max-w-none min-w-[260px]">
            <div className="flex items-center justify-between mb-1.5">
              <button type="button" className="px-1 py-0.5 rounded hover:bg-gray-100 cursor-pointer" onClick={() => setViewMonth(viewMonth - 1)}>
                <i className="ri-arrow-left-s-line"></i>
              </button>
              <div className="text-sm font-medium text-gray-800">{viewYear}-{pad2(viewMonth + 1)}</div>
              <button type="button" className="px-1 py-0.5 rounded hover:bg-gray-100 cursor-pointer" onClick={() => setViewMonth(viewMonth + 1)}>
                <i className="ri-arrow-right-s-line"></i>
              </button>
            </div>

            <div className="grid grid-cols-7 gap-0.5 text-sm text-gray-500 mb-1 min-w-[260px]">
              {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (<div key={d} className="text-center py-0.5">{d}</div>))}
            </div>
            <div className="grid grid-cols-7 gap-0 mb-2">
              {daysMatrix.map((cell, idx) => {
                const y = viewYear;
                const m = viewMonth + (cell.inMonth ? 0 : (idx < 7 && cell.day > 7 ? -1 : 1));
                const d = cell.day;
                const selected = isSameDay(selDate, y, m, d);
                return (
                  <button
                    key={`${idx}-${cell.day}-${cell.inMonth ? 'm' : 'o'}`}
                    type="button"
                    onClick={() => onSelectDay(cell, idx)}
                    className={`w-7 h-8 flex items-center justify-center text-sm rounded cursor-pointer ${cell.inMonth ? 'text-gray-800' : 'text-gray-400'} ${selected ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
                  >
                    {cell.day}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5">
                <select
                  className="border border-gray-300 rounded px-2 py-1 text-xs"
                  value={selDate.getHours()}
                  onChange={(e) => onTimeChange('h', parseInt(e.target.value))}
                >
                  {Array.from({ length: 24 }, (_, i) => (<option key={i} value={i}>{pad2(i)}</option>))}
                </select>
                <span>:</span>
                <select
                  className="border border-gray-300 rounded px-2 py-1 text-xs"
                  value={selDate.getMinutes()}
                  onChange={(e) => onTimeChange('m', parseInt(e.target.value))}
                >
                  {Array.from({ length: 60 }, (_, i) => (<option key={i} value={i}>{pad2(i)}</option>))}
                </select>
                <span>:</span>
                <select
                  className="border border-gray-300 rounded px-2 py-1 text-xs"
                  value={selDate.getSeconds()}
                  onChange={(e) => onTimeChange('s', parseInt(e.target.value))}
                >
                  {Array.from({ length: 60 }, (_, i) => (<option key={i} value={i}>{pad2(i)}</option>))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" className="px-3 py-1.5 border border-gray-300 rounded-md text-sm hover:bg-gray-50 cursor-pointer" onClick={() => onChange && onChange('')}>Clear</button>
                <button type="button" className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 cursor-pointer" onClick={() => commitChange(selDate)}>OK</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
