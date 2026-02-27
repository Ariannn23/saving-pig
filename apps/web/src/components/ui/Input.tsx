import React, { useState } from "react";
import { LucideIcon } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: LucideIcon;
  error?: string;
  helper?: string;
  validation?: (value: string) => boolean;
  validationMessage?: string;
  onValidationChange?: (isValid: boolean) => void;
  containerClass?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      icon: Icon,
      error,
      helper,
      validation,
      validationMessage,
      onValidationChange,
      containerClass = "",
      className = "",
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [validationError, setValidationError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      
      // Check validation
      if (validation) {
        const isValid = validation(val) || val === "";
        setValidationError(isValid || val === "" ? "" : validationMessage || "Valor inválido");
        onValidationChange?.(isValid || val === "");
      }

      onChange?.(e);
    };

    const displayError = error || validationError;
    const hasIcon = !!Icon;

    return (
      <div className={`space-y-1.5 ${containerClass}`}>
        {label && (
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 block">
            {label}
          </label>
        )}
        <div className="relative group">
          {Icon && (
            <Icon
              className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors pointer-events-none ${
                isFocused
                  ? "text-rose-500"
                  : displayError
                    ? "text-rose-400"
                    : "text-slate-500"
              }`}
            />
          )}
          <input
            ref={ref}
            value={value}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`glass-input w-full text-sm focus:ring-1 transition-all ${
              hasIcon ? "!pl-14" : ""
            } ${
              displayError
                ? "focus:ring-rose-500/50 border-rose-500/20"
                : "focus:ring-rose-500/50"
            } ${className}`}
            {...props}
          />
        </div>
        {displayError && (
          <span className="text-[10px] text-rose-400 block ml-1 font-medium">
            {displayError}
          </span>
        )}
        {helper && !displayError && (
          <span className="text-[10px] text-slate-500 block ml-1">
            {helper}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
