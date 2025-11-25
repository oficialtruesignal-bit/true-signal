interface ActivityDay {
  date: string;
  count: number;
  intensity: number;
}

interface ActivityHeatmapProps {
  data: ActivityDay[];
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const getColor = (intensity: number) => {
    if (intensity === 0) return 'bg-[#161616]';
    if (intensity === 1) return 'bg-primary/20';
    if (intensity === 2) return 'bg-primary/40';
    if (intensity === 3) return 'bg-primary/60';
    return 'bg-primary';
  };

  // Group by weeks (7 days per row)
  const weeks: ActivityDay[][] = [];
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7));
  }

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Matriz de Atividade
      </h4>
      <div className="flex gap-1 flex-wrap">
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="flex flex-col gap-1">
            {week.map((day) => (
              <div
                key={day.date}
                className={`w-3 h-3 rounded-sm ${getColor(day.intensity)} border border-[#222] transition-colors`}
                title={`${day.date}: ${day.count} verdes`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 text-[9px] text-muted-foreground mt-2">
        <span>Menos</span>
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-[#161616] border border-[#222] rounded-sm" />
          <div className="w-2 h-2 bg-primary/20 border border-[#222] rounded-sm" />
          <div className="w-2 h-2 bg-primary/40 border border-[#222] rounded-sm" />
          <div className="w-2 h-2 bg-primary/60 border border-[#222] rounded-sm" />
          <div className="w-2 h-2 bg-primary border border-[#222] rounded-sm" />
        </div>
        <span>Mais</span>
      </div>
    </div>
  );
}
