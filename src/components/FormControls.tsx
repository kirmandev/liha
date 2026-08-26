"use client";

import type { ReactNode } from "react";

const FIELD =
  "w-full rounded-2xl border-2 border-wine/15 bg-cream px-4 py-3 text-ink transition-colors placeholder:text-ink-soft/60 focus:border-wine focus:outline-none";

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
  className = "",
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label htmlFor={htmlFor} className="text-sm font-semibold text-wine">
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs leading-relaxed text-ink-soft">{hint}</p> : null}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="text-xs font-semibold text-rust">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TextInput({
  error,
  ...rest
}: React.ComponentProps<"input"> & { error?: string }) {
  return (
    <input
      {...rest}
      aria-invalid={error ? true : undefined}
      aria-describedby={error && rest.id ? `${rest.id}-error` : undefined}
      className={`${FIELD} ${error ? "border-rust" : ""}`}
    />
  );
}

export function TextArea({
  error,
  ...rest
}: React.ComponentProps<"textarea"> & { error?: string }) {
  return (
    <textarea
      {...rest}
      aria-invalid={error ? true : undefined}
      aria-describedby={error && rest.id ? `${rest.id}-error` : undefined}
      className={`${FIELD} min-h-32 resize-y ${error ? "border-rust" : ""}`}
    />
  );
}

export function Select({
  error,
  options,
  ...rest
}: React.ComponentProps<"select"> & { error?: string; options: readonly string[] }) {
  return (
    <select
      {...rest}
      aria-invalid={error ? true : undefined}
      aria-describedby={error && rest.id ? `${rest.id}-error` : undefined}
      className={`${FIELD} ${error ? "border-rust" : ""}`}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
