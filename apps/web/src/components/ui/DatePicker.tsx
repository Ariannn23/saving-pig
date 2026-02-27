import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface DatePickerProps {
  value: string; // ISO format: YYYY-MM-DD
  onChange: (date: string) => void;
  maxDate?: string;
  minDate?: string;
  label?: string;
}

export const DatePicker = React.forwardRef<HTMLDivElement, DatePickerProps>(
  ({ value, onChange, maxDate, minDate, label }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState<Date>(
      value ? new Date(value) : new Date()
    );
    const containerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
          document.removeEventListener("mousedown", handleClickOutside);
      }
    }, [isOpen]);

    const getDaysInMonth = (date: Date): number => {
      return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date): number => {
      return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const formatDate = (date: string): string => {
      const d = new Date(date + "T00:00:00");
      const monthNames = [
        "Ene",
        "Feb",
        "Mar",
        "Abr",
        "May",
        "Jun",
        "Jul",
        "Ago",
        "Sep",
        "Oct",
        "Nov",
        "Dic",
      ];
      return `${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    };

    const handleDateSelect = (day: number) => {
      const selected = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day
      );
      const isoDate = selected.toISOString().split("T")[0];
      onChange(isoDate);
      setIsOpen(false);
    };

    const handlePrevMonth = () => {
      setCurrentMonth(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
      );
    };

    const handleNextMonth = () => {
      setCurrentMonth(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
      );
    };

    const days: (number | null)[] = [];
    const firstDay = getFirstDayOfMonth(currentMonth);
    const daysInMonth = getDaysInMonth(currentMonth);

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    const isDateDisabled = (day: number): boolean => {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day
      );
      const isoDate = date.toISOString().split("T")[0];

      if (maxDate && isoDate > maxDate) return true;
      if (minDate && isoDate < minDate) return true;
      return false;
    };

    const isDateSelected = (day: number): boolean => {
      if (!value) return false;
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day
      );
      const isoDate = date.toISOString().split("T")[0];
      return isoDate === value;
    };

    const monthNames = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];

    const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sab"];

    return (
      <div ref={ref} className="space-y-1.5">
        {label && (
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {label}
          </label>
        )}
        <div ref={containerRef} className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="glass-input w-full text-sm text-left px-4 py-2.5 flex items-center justify-between"
          >
            <span>
              {value ? formatDate(value) : "Seleccionar fecha..."}
            </span>
            <Calendar className="h-4 w-4 text-slate-500" />
          </button>

          {isOpen && (
            <div
              ref={dropdownRef}
              className="absolute top-full left-0 right-0 mt-2 glass-card p-4 rounded-2xl shadow-2xl z-50 w-full min-w-72"
            >
              {/* Month/Year Header */}
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <h3 className="text-sm font-bold">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h3>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs font-bold text-slate-500"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => day !== null && handleDateSelect(day)}
                    disabled={day === null || (day !== null && isDateDisabled(day))}
                    className={`h-8 text-sm rounded-lg font-medium transition-colors ${
                      day === null
                        ? ""
                        : isDateSelected(day)
                          ? "bg-rose-500 text-white"
                          : isDateDisabled(day)
                            ? "text-slate-700 cursor-not-allowed"
                            : "text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>

              {/* Quick actions */}
              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date().toISOString().split("T")[0];
                    onChange(today);
                    setIsOpen(false);
                  }}
                  className="text-xs font-bold text-rose-400 hover:text-rose-300 py-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  Hoy
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-300 py-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

DatePicker.displayName = "DatePicker";
