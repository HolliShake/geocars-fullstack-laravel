import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { GetMachineInfo200 } from '@rest/models';
import {
  Activity,
  Circle,
  Cpu,
  HardDrive,
  MemoryStick,
  MonitorDot,
  Server,
  Zap,
} from 'lucide-react';
import React from 'react';

/* ── Skeleton ────────────────────────────────────────── */
const SkeletonRow = () => (
  <div className="flex items-center gap-3 py-3 px-1">
    <div className="h-8 w-8 rounded-lg bg-muted animate-pulse shrink-0" />
    <div className="flex-1 space-y-1.5">
      <div className="h-2.5 w-20 rounded bg-muted animate-pulse" />
      <div className="h-3.5 w-36 rounded bg-muted/70 animate-pulse" />
    </div>
  </div>
);

/* ── Util Bar ─────────────────────────────────────────── */
function UtilBar({
  label,
  value,
  max,
  unit,
  icon: Icon,
}: {
  label: string;
  value: number;
  max: number;
  unit: string;
  icon: React.ElementType;
}) {
  const pct = Math.min(100, (value / max) * 100);
  const heatColor = pct > 85 ? 'text-destructive' : pct > 60 ? 'text-amber-500' : 'text-primary';
  const barGradient =
    pct > 85
      ? 'from-destructive to-rose-400'
      : pct > 60
        ? 'from-amber-500 to-yellow-400'
        : 'from-purple-500 via-indigo-600 to-blue-600';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon className="h-3.5 w-3.5" />
          <span className="text-[11px] font-semibold uppercase tracking-widest">{label}</span>
        </div>
        <span className={`font-mono text-xs font-bold tabular-nums ${heatColor}`}>
          {value.toFixed(1)}&thinsp;{unit}
        </span>
      </div>

      {/* Track */}
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r transition-all duration-700 ease-out ${barGradient}`}
          style={{ width: `${pct}%` }}
        />
        {/* Glow */}
        <div
          className="absolute inset-y-0 left-0 rounded-full blur-sm opacity-50 transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: pct > 85 ? 'var(--destructive)' : pct > 60 ? '#f59e0b' : '#7c3aed',
          }}
        />
      </div>

      <div className="flex justify-between text-[10px] text-muted-foreground/50 font-mono">
        <span>0</span>
        <span>
          {max}&thinsp;{unit}
        </span>
      </div>
    </div>
  );
}

/* ── Info Row ─────────────────────────────────────────── */
function InfoRow({
  icon: Icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="group flex items-start gap-3 rounded-lg px-1 py-2.5 -mx-1 transition-colors hover:bg-accent">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-muted transition-all group-hover:border-primary/40 group-hover:bg-primary/10">
        <Icon className="h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          {label}
        </p>
        <p className={`truncate text-sm text-foreground ${mono ? 'font-mono' : 'font-medium'}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

/* ── Main Component ───────────────────────────────────── */
export const MachineInfo: React.FC<{ data: GetMachineInfo200; loading?: boolean }> = ({
  data,
  loading,
}) => {
  /* loading */
  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-lg">
        <div className="mb-5 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-muted animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-4 w-32 rounded bg-muted animate-pulse" />
            <div className="h-2.5 w-20 rounded bg-muted/60 animate-pulse" />
          </div>
          <div className="ml-auto h-5 w-14 rounded-full bg-muted animate-pulse" />
        </div>
        {[...Array(4)].map((_, i) => (
          <SkeletonRow key={i} />
        ))}
        <div className="mt-4 space-y-5 rounded-lg border border-border bg-muted/30 p-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <div className="h-3 w-24 rounded bg-muted animate-pulse" />
                <div className="h-3 w-12 rounded bg-muted animate-pulse" />
              </div>
              <div className="h-2 w-full rounded-full bg-muted animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const usedRam = data.TotalRam - data.AvailableRam;
  const cpuPct = data.CpuUtilization;

  const statusDot =
    cpuPct > 85 ? 'text-destructive' : cpuPct > 60 ? 'text-amber-500' : 'text-emerald-500';
  const statusLabel = cpuPct > 85 ? 'Critical' : cpuPct > 60 ? 'Moderate' : 'Healthy';

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card shadow-lg">
      {/* Subtle ambient glow behind card */}
      <div className="pointer-events-none absolute -top-20 right-0 h-48 w-48 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative p-6">
        {/* ── Header ── */}
        <div className="mb-5 flex items-center gap-3">
          {/* Icon badge with primary gradient */}
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-700 shadow-lg shadow-purple-500/25">
            <Server className="h-4 w-4 text-white" strokeWidth={1.75} />
          </div>

          <div>
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              Machine Information
            </h2>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              System overview
            </p>
          </div>

          {/* Status badge */}
          <div className="ml-auto flex items-center gap-1.5">
            <Circle className={`h-2 w-2 fill-current animate-pulse ${statusDot}`} />
            <Badge
              variant="outline"
              className="border-border bg-muted/50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
            >
              {statusLabel}
            </Badge>
          </div>
        </div>

        {/* ── Info rows ── */}
        <div>
          <InfoRow icon={MonitorDot} label="Operating System" value={data.HOSTOS} />
          <Separator className="my-0.5" />
          <InfoRow icon={HardDrive} label="CPU Vendor" value={data.CpuVendor} />
          <Separator className="my-0.5" />
          <InfoRow icon={Cpu} label="CPU Model" value={data.CpuModel} />
          <Separator className="my-0.5" />
          <InfoRow icon={Zap} label="CPU Clock Speed" value={data.CpuSpeed} mono />
        </div>

        {/* ── Utilization Panel ── */}
        <div className="mt-5 rounded-lg border border-border bg-muted/20 p-4 space-y-5">
          {/* Panel header */}
          <div className="flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Resource Utilization
            </span>
          </div>

          <UtilBar label="CPU Usage" value={cpuPct} max={100} unit="%" icon={Cpu} />

          <UtilBar
            label="RAM Used"
            value={usedRam / 1024}
            max={data.TotalRam / 1024}
            unit="GB"
            icon={MemoryStick}
          />

          {/* Memory chips */}
          <div className="flex flex-wrap gap-2 pt-1">
            {[
              { label: 'Total', val: `${(data.TotalRam / 1024).toFixed(1)} GB` },
              { label: 'Used', val: `${(usedRam / 1024).toFixed(1)} GB` },
              { label: 'Free', val: `${(data.AvailableRam / 1024).toFixed(1)} GB` },
            ].map(({ label, val }) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-md border border-border bg-background px-2.5 py-1.5"
              >
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {label}
                </span>
                <span className="font-mono text-xs font-bold text-foreground">{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MachineInfo;
