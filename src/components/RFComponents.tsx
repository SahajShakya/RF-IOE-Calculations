import React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { cn } from "../lib/utils";

interface ToolCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const ToolCard: React.FC<ToolCardProps> = ({ title, description, children }) => (
  <Card className="w-full">
    <CardHeader className="border-b">
      <CardTitle className="text-xl">{title}</CardTitle>
      {description && <CardDescription>{description}</CardDescription>}
    </CardHeader>
    <CardContent className="space-y-5 pt-5">{children}</CardContent>
  </Card>
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

export const Field: React.FC<FieldProps> = ({ label, hint, className, inputProps }) => (
  <label className={cn("block space-y-1.5", className)}>
    <span className="flex items-center justify-between gap-2 text-sm font-medium text-foreground">
      <span>{label}</span>
      {hint && <span className="text-xs font-normal text-muted-foreground">{hint}</span>}
    </span>
    <Input {...inputProps} />
  </label>
);

interface ActionBarProps {
  onCalculate: () => void;
  onInsert?: () => void;
}

export const ActionBar: React.FC<ActionBarProps> = ({ onCalculate, onInsert }) => (
  <div className="flex flex-wrap gap-2">
    <Button type="button" onClick={onCalculate}>
      Calculate
    </Button>
    {onInsert && (
      <Button type="button" variant="secondary" onClick={onInsert}>
        Insert into Content
      </Button>
    )}
  </div>
);

export const ResultCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Card className="bg-muted/40">
    <CardContent className="space-y-4 pt-6">{children}</CardContent>
  </Card>
);

interface ResultRowProps {
  label: React.ReactNode;
  value: React.ReactNode;
  badge?: React.ReactNode;
}

export const ResultRow: React.FC<ResultRowProps> = ({ label, value, badge }) => (
  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-2 last:border-0 last:pb-0">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="flex items-center gap-2 text-sm font-medium text-foreground">
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
    <h4 className="text-sm font-semibold text-foreground">{title}</h4>
    <div className="space-y-2">{children}</div>
  </div>
);

export const StatusBadge: React.FC<{ ok: boolean }> = ({ ok }) =>
  ok ? <Badge variant="default">✓</Badge> : <Badge variant="destructive">✗</Badge>;

export const Divider: React.FC = () => <hr className="border-border/60" />;

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
      <div key={p.label} className="space-y-2 rounded-md border bg-card p-3">
        <p className="text-sm font-semibold text-primary">{p.label}</p>
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