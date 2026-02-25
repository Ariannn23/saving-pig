import { useState, useRef, useEffect, ReactNode } from "react";
import { ChevronDown, Check } from "lucide-react";
import { createPortal } from "react-dom";

interface SelectOption {
  value: string;
  label: string;
  icon?: ReactNode;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  label?: string;
  id?: string;
}

export const Select = ({
  value,
  onChange,
  options,
  placeholder = "Seleccionar...",
  className = "",
  id,
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropPos, setDropPos] = useState({
    top: 0,
    left: 0,
    width: 0,
    openUp: false,
  });
  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  // Close on outside click — must exclude both the trigger AND the portal dropdown
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        ref.current?.contains(e.target as Node) ||
        dropRef.current?.contains(e.target as Node)
      ) {
        return; // click is inside trigger or dropdown — do nothing
      }
      setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Recalculate position on scroll/resize
  useEffect(() => {
    if (!isOpen) return;
    const update = () => {
      if (!btnRef.current) return;
      const rect = btnRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUp = spaceBelow < 260 && rect.top > 260;
      setDropPos({
        top: openUp ? rect.top - 8 : rect.bottom + 8,
        left: rect.left,
        width: rect.width,
        openUp,
      });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [isOpen]);

  const handleOpen = () => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < 260 && rect.top > 260;
    setDropPos({
      top: openUp ? rect.top - 8 : rect.bottom + 8,
      left: rect.left,
      width: rect.width,
      openUp,
    });
    setIsOpen((prev) => !prev);
  };

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  const dropdown = isOpen && (
    <div
      ref={dropRef}
      style={{
        position: "fixed",
        top: dropPos.openUp ? undefined : dropPos.top,
        bottom: dropPos.openUp ? window.innerHeight - dropPos.top : undefined,
        left: dropPos.left,
        width: dropPos.width,
        zIndex: 9999,
      }}
      className="rounded-2xl border border-white/10 bg-slate-950/95 backdrop-blur-2xl shadow-2xl shadow-black/50 overflow-hidden"
    >
      <ul
        role="listbox"
        className="max-h-60 overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
      >
        {placeholder && (
          <li
            key="__placeholder"
            role="option"
            aria-selected={!value}
            onClick={() => handleSelect("")}
            className="flex items-center justify-between gap-2 px-4 py-2.5 text-sm cursor-pointer text-slate-500 hover:bg-white/5 transition-colors"
          >
            {placeholder}
          </li>
        )}
        {options.map((opt) => {
          const isSelected = opt.value === value;
          return (
            <li
              key={opt.value}
              role="option"
              aria-selected={isSelected}
              onClick={() => handleSelect(opt.value)}
              className={`flex items-center justify-between gap-2 px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                isSelected
                  ? "bg-rose-500/10 text-rose-400"
                  : "text-slate-200 hover:bg-white/5"
              }`}
            >
              <span className="flex items-center gap-2">
                {opt.icon && (
                  <span
                    className={`shrink-0 ${isSelected ? "text-rose-400" : "text-slate-500"}`}
                  >
                    {opt.icon}
                  </span>
                )}
                {opt.label}
              </span>
              {isSelected && <Check className="h-4 w-4 shrink-0" />}
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <div ref={ref} className={`relative ${className}`} id={id}>
      {/* Trigger */}
      <button
        ref={btnRef}
        type="button"
        onClick={handleOpen}
        className="glass-input w-full text-sm flex items-center justify-between gap-2 cursor-pointer"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        title="Seleccionar opción"
      >
        <span
          className={`flex items-center gap-2 truncate ${!selected ? "text-slate-600" : "text-white"}`}
        >
          {selected?.icon && (
            <span className="text-rose-400 shrink-0">{selected.icon}</span>
          )}
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-slate-500 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown rendered in portal to escape any overflow:hidden parent */}
      {typeof document !== "undefined" && createPortal(dropdown, document.body)}
    </div>
  );
};
