"use client";

import { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
};

export function FormShell({ title, description, icon, children, actions }: Props) {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {icon ? (
            <div className="grid h-11 w-11 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-brand-cyan">
              {icon}
            </div>
          ) : null}
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-white">
              {title}
            </h1>
            {description ? (
              <p className="mt-1 max-w-xl text-sm text-zinc-400">{description}</p>
            ) : null}
          </div>
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>

      <div className="rounded-2xl border border-white/10 bg-zinc-900/40 p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset] backdrop-blur">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">{children}</div>
      </div>
    </div>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
  full?: boolean;
  type?: string;
  rows?: number;
};

export function Field({
  label,
  value,
  onChange,
  placeholder,
  textarea = false,
  full = false,
  type = "text",
  rows = 3,
}: FieldProps) {
  return (
    <label className={`flex flex-col gap-2 ${full ? "md:col-span-2" : ""}`}>
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
        {label}
      </span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="resize-y rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-brand-cyan/60 focus:ring-2 focus:ring-brand-cyan/20"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="rounded-lg border border-white/10 bg-zinc-950/60 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-brand-cyan/60 focus:ring-2 focus:ring-brand-cyan/20"
        />
      )}
    </label>
  );
}
