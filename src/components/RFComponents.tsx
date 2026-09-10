import React, { useState } from "react";
import { cn } from "../lib/cn";

export const ToolCard: React.FC<{
  title: string;
  description?: string;
  children: React.ReactNode;
}> = ({ title, description, children }) => (
  <div className="rf-tool-card">
    <div className="rf-mb-4">
      <h3 className="rf-tool-title">{title}</h3>
      {description && <p className="rf-tool-desc">{description}</p>}
    </div>
    <div className="rf-space-y-4">{children}</div>
  </div>
);

export const FieldGrid: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className, children }) => (
  <div className={cn("rf-grid rf-grid-2", className)}>{children}</div>
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
    <div className={cn("rf-field", className)}>
      <label className={cn("rf-field-label", active && "rf-field-label-float")} style={{ zIndex: active ? "10" : "0" }}>
        {label} {hint && <span className="rf-field-hint">({hint})</span>}
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
        className={cn("rf-input", inputProps?.className)}
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
  <div className={cn("rf-field", className)}>
    {label && (
      <label
        className={cn("rf-field-label", value && "rf-field-label-float")}
        style={{ zIndex: value ? "10" : "0" }}
      >
        {label}
      </label>
    )}
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className="rf-select"
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
    primary: "rf-btn-primary",
    secondary: "rf-btn-secondary",
    success: "rf-btn-success",
  };
  return (
    <button type={type} onClick={onClick} className={cn("rf-btn", styles[variant], className)}>
      {children}
    </button>
  );
};

interface ActionBarProps {
  onCalculate: () => void;
  onInsert?: () => void;
}

export const ActionBar: React.FC<ActionBarProps> = ({ onCalculate, onInsert }) => (
  <div className="rf-flex-wrap rf-pt-1">
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
  <div className="rf-result-card">
    <div className="rf-space-y-2">{children}</div>
  </div>
);

interface ResultRowProps {
  label: React.ReactNode;
  value: React.ReactNode;
  badge?: React.ReactNode;
}

export const ResultRow: React.FC<ResultRowProps> = ({ label, value, badge }) => (
  <div className="rf-result-row">
    <span className="rf-result-label">{label}</span>
    <span className="rf-result-value">
      {value}
      {badge}
    </span>
  </div>
);

export const ResultSection: React.FC<{
  title: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, children }) => (
  <div className="rf-space-y-2">
    <p className="rf-result-section-title">{title}</p>
    <div className="rf-space-y-1">{children}</div>
  </div>
);

export const StatusBadge: React.FC<{ ok: boolean }> = ({ ok }) => (
  <span className={cn("rf-badge", ok ? "rf-badge-ok" : "rf-badge-fail")}>{ok ? "✓" : "✗"}</span>
);

export const Divider: React.FC = () => <hr className="rf-divider" />;

export interface SPort {
  label: string;
  mag: string;
  angle: string;
  setMag: (value: string) => void;
  setAngle: (value: string) => void;
}

export const SParameterInputs: React.FC<{ ports: SPort[] }> = ({ ports }) => (
  <div className="rf-grid rf-grid-span">
    {ports.map((p) => (
      <div key={p.label} className="rf-port-box">
        <p className="rf-port-header">{p.label}</p>
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
  <table className="rf-table">{children}</table>
);

export const TableHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <thead className="rf-thead">{children}</thead>
);

export const TableBody: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <tbody className="rf-tbody">{children}</tbody>
);

export const TableRow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <tr className="rf-tr">{children}</tr>
);

export const TableHead: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <th scope="col" className={cn("rf-th", className)}>
    {children}
  </th>
);

export const TableCell: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => <td className={cn("rf-td", className)}>{children}</td>;