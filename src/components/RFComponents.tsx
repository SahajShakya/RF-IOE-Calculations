import React, { useState } from "react";
import { cn } from "../lib/cn";

export const ToolCard: React.FC<{
  title: string;
  description?: string;
  children: React.ReactNode;
}> = ({ title, description, children }) => (
  <div className="border border-gray-300 bg-white rounded-lg shadow-md p-4">
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

export const FieldGrid: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className, children }) => (
  <div className={cn("grid gap-3 sm:grid-cols-2", className)}>{children}</div>
);

interface FieldProps {
  label: React.ReactNode;
  hint?: string;
  className?: string;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}

export const Field: React.FC<FieldProps> = ({ label, hint, className, inputProps }) => {
  const [isFocused, setIsFocused] = useState(false);
  const { value } = inputProps ?? {};
  const active = isFocused || !!value;

  return (
    <div className={cn("relative mt-6", className)}>
      <label
        className={`absolute left-3 bg-white px-1 ${
          active ? "-top-2 text-xs text-gray-500" : "top-2 text-sm text-gray-700"
        } transition-all duration-200 pointer-events-none`}
        style={{ zIndex: active ? "10" : "0" }}
      >
        {label} {hint && <span className="text-xs text-gray-400">({hint})</span>}
      </label>
      <input
        {...inputProps}
        onFocus={(e) => {
          setIsFocused(true);
          inputProps?.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          inputProps?.onBlur?.(e);
        }}
        className={`mt-1 block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${inputProps?.className ?? ""}`}
      />
    </div>
  );
};

interface SelectProps {
  label?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: { id: string | number; name: string }[];
  className?: string;
}

export const Select: React.FC<SelectProps> = ({ label, value, onValueChange, options, className }) => (
  <div className={cn("relative mt-6", className)}>
    {label && (
      <label
        className={`absolute left-3 bg-white px-1 ${
          value ? "-top-2 text-xs text-gray-500" : "top-2 text-sm text-gray-700"
        } transition-all duration-200 pointer-events-none`}
        style={{ zIndex: value ? "10" : "0" }}
      >
        {label}
      </label>
    )}
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className="mt-1 block w-full px-3 py-3 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
    >
      {options.map((option) => (
        <option key={option.id} value={String(option.id)}>
          {option.name}
        </option>
      ))}
    </select>
  </div>
);

interface ButtonProps {
  variant?: "primary" | "secondary" | "success";
  type?: "button" | "submit";
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  type = "button",
  className,
  children,
  onClick,
}) => {
  const styles: Record<string, string> = {
    primary: "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-400",
    success: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${styles[variant]} ${className ?? ""}`}
    >
      {children}
    </button>
  );
};

interface ActionBarProps {
  onCalculate: () => void;
  onInsert?: () => void;
}

export const ActionBar: React.FC<ActionBarProps> = ({ onCalculate, onInsert }) => (
  <div className="flex flex-wrap gap-2 pt-1">
    <Button type="button" onClick={onCalculate}>
      Calculate
    </Button>
    {onInsert && (
      <Button type="button" variant="success" onClick={onInsert}>
        Insert into Content
      </Button>
    )}
  </div>
);

export const ResultCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg text-sm space-y-2">
    {children}
  </div>
);

interface ResultRowProps {
  label: React.ReactNode;
  value: React.ReactNode;
  badge?: React.ReactNode;
}

export const ResultRow: React.FC<ResultRowProps> = ({ label, value, badge }) => (
  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-2 last:border-0 last:pb-0">
    <span className="text-xs font-medium text-gray-600">{label}</span>
    <span className="flex items-center gap-2 text-sm font-medium text-gray-900">
      {value}
      {badge}
    </span>
  </div>
);

export const ResultSection: React.FC<{
  title: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, children }) => (
  <div className="space-y-2">
    <p className="text-sm font-semibold text-gray-700">{title}</p>
    <div className="space-y-1">{children}</div>
  </div>
);

export const StatusBadge: React.FC<{ ok: boolean }> = ({ ok }) =>
  ok ? (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-700">
      ✓
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-700">
      ✗
    </span>
  );

export const Divider: React.FC = () => <hr className="my-2 border-gray-200" />;

export interface SPort {
  label: string;
  mag: string;
  angle: string;
  setMag: (value: string) => void;
  setAngle: (value: string) => void;
}

export const SParameterInputs: React.FC<{ ports: SPort[] }> = ({ ports }) => (
  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
    {ports.map((p) => (
      <div key={p.label} className="p-3 border border-gray-200 rounded-md">
        <p className="text-sm font-semibold text-gray-800 mb-2">{p.label}</p>
        <Field
          label="|Mag|"
          inputProps={{
            type: "number",
            step: "0.01",
            value: p.mag,
            onChange: (e) => p.setMag(e.target.value),
          }}
        />
        <Field
          label="∠ (deg)"
          inputProps={{
            type: "number",
            step: "0.1",
            value: p.angle,
            onChange: (e) => p.setAngle(e.target.value),
          }}
        />
      </div>
    ))}
  </div>
);

export const Table: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden text-sm">
    {children}
  </table>
);

export const TableHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <thead className="bg-gray-50">{children}</thead>
);

export const TableBody: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <tbody className="divide-y divide-gray-200 bg-white">{children}</tbody>
);

export const TableRow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <tr>{children}</tr>
);

export const TableHead: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <th
    scope="col"
    className={`px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${className ?? ""}`}
  >
    {children}
  </th>
);

export const TableCell: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => <td className={`px-3 py-2 whitespace-nowrap text-gray-800 ${className ?? ""}`}>{children}</td>;