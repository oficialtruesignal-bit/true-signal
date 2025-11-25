import { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  trendColor?: string;
}

export function StatCard({ label, value, icon, trendColor = "text-white" }: StatCardProps) {
  return (
    <div className="flex-1 bg-[#121212] border border-[#333] rounded-lg p-4 flex flex-col justify-center h-full min-h-[90px]">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
      </div>
      <p className={`text-2xl font-bold font-mono ${trendColor}`}>
        {value}
      </p>
    </div>
  );
}
