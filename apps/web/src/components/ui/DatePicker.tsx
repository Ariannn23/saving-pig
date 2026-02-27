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

    const getDaysInMonth = (date: Date): number =>
      new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

    const getFirstDayOfMonth = (date: Date): number =>
      new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const formatDate = (date: string): string => {
      const d = new Date(date + "T00:00:00");
      const monthNames = [
        "Ene","Feb","Mar","Abr","May","Jun",
        "Jul","Ago","Sep","Oct","Nov","Dic",
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

    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

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
      "Enero","Febrero","Marzo","Abril","Mayo","Junio",
      "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
    ];

    const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sab"];

    return (
      <div ref={ref} className="space-y-1.5">
        {label && (
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {label}
          </label>
        )}

        <div ref={containerRef} className="relative">
          {/* Input */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="
              w-full text-sm text-left px-4 py-2.5 flex items-center justify-between
              rounded-xl border border-white/10
              bg-slate-900 text-slate-200
              hover:border-rose-500/40
              focus:outline-none focus:ring-2 focus:ring-rose-500/30
              transition-all
            "
          >
            <span className={value ? "text-slate-200" : "text-slate-500"}>
              {value ? formatDate(value) : "Seleccionar fecha..."}
            </span>
            <Calendar className="h-4 w-4 text-slate-400" />
          </button>

          {/* Calendar */}
          {isOpen && (
            <div
              className="
                absolute top-full left-0 right-0 mt-2
                bg-slate-950
                border border-white/10
                rounded-2xl shadow-2xl
                p-4 z-50 w-full min-w-72
              "
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 text-slate-300" />
                </button>

                <h3 className="text-sm font-bold text-slate-100">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h3>

                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 transition-colors"
                >
                  <ChevronRight className="h-4 w-4 text-slate-300" />
                </button>
              </div>

              {/* Week days */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="text-center text-[11px] font-bold text-slate-500"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Days */}

              {/* Days */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, idx) => {
                  const selected = day !== null && isDateSelected(day);
                  const disabled = day === null || (day !== null && isDateDisabled(day));
                  
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => day !== null && !disabled && handleDateSelect(day)}
                      disabled={disabled}
                      className={`
                        h-10 w-full text-sm rounded-xl font-medium transition-all duration-200
                        flex items-center justify-center
                        ${
                          day === null
                            ? "bg-transparent cursor-default"
                            : selected
                            ? "bg-rose-600 text-white shadow-lg shadow-rose-900/20" // Seleccionado: Color sólido
                            : disabled
                            ? "text-slate-800 cursor-not-allowed" // Deshabilitado: Muy sutil
                            : "text-slate-400 bg-transparent hover:bg-white/10 hover:text-rose-400" // Normal: Fondo transparente, hover suave
                        }
                      `}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date().toISOString().split("T")[0];
                    onChange(today);
                    setIsOpen(false);
                  }}
                  className="
                    text-xs font-bold py-2 rounded-lg
                    bg-rose-600/15 text-rose-400
                    hover:bg-rose-600/25 hover:text-rose-300
                    transition-colors
                  "
                >
                  Hoy
                </button>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="
                    text-xs font-bold py-2 rounded-lg
                    bg-slate-900 text-slate-400
                    hover:bg-slate-800 hover:text-slate-200
                    transition-colors
                  "
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