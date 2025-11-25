// MarketSelector - Standardized Betting Market Selector
// Prevents typos and ensures consistent market naming

interface MarketGroup {
  label: string;
  options: string[];
}

const MARKET_OPTIONS: MarketGroup[] = [
  {
    label: "Principais (Resultado)",
    options: [
      "Vitória Casa (Home)",
      "Vitória Visitante (Away)",
      "Empate (Draw)",
      "Dupla Chance: Casa ou Empate",
      "Dupla Chance: Visitante ou Empate",
      "Dupla Chance: Casa ou Visitante",
      "Empate Anula Aposta (DNB) Casa",
      "Empate Anula Aposta (DNB) Visitante"
    ]
  },
  {
    label: "Gols (Over/Under)",
    options: [
      "Mais de 0.5 Gols (Over 0.5)",
      "Mais de 1.5 Gols (Over 1.5)",
      "Mais de 2.5 Gols (Over 2.5)",
      "Mais de 3.5 Gols (Over 3.5)",
      "Menos de 1.5 Gols (Under 1.5)",
      "Menos de 2.5 Gols (Under 2.5)",
      "Menos de 3.5 Gols (Under 3.5)",
      "Menos de 4.5 Gols (Under 4.5)",
      "Ambas Equipes Marcam: SIM (BTTS Yes)",
      "Ambas Equipes Marcam: NÃO (BTTS No)"
    ]
  },
  {
    label: "1º Tempo (HT)",
    options: [
      "HT - Vitória Casa",
      "HT - Vitória Visitante",
      "HT - Empate",
      "HT - Mais de 0.5 Gols",
      "HT - Mais de 1.5 Gols",
      "HT - Ambas Marcam"
    ]
  },
  {
    label: "Escanteios (Corners)",
    options: [
      "Mais de 7.5 Escanteios",
      "Mais de 8.5 Escanteios",
      "Mais de 9.5 Escanteios",
      "Mais de 10.5 Escanteios",
      "Escanteios Asiáticos: Mais de X",
      "Corrida (Race) para 5 Escanteios",
      "Corrida (Race) para 7 Escanteios"
    ]
  },
  {
    label: "Handicaps / Asiáticos",
    options: [
      "Handicap Asiático -0.25",
      "Handicap Asiático -0.5",
      "Handicap Asiático -0.75",
      "Handicap Asiático -1.0",
      "Handicap Asiático +0.25",
      "Handicap Asiático +0.5",
      "Handicap Asiático +0.75",
      "Handicap Asiático +1.0"
    ]
  },
  {
    label: "Especiais / Outros",
    options: [
      "Vitória Casa + Mais de 2.5 Gols",
      "Vitória Visitante + Mais de 2.5 Gols",
      "Qualquer Jogador Marcar",
      "Cartão Vermelho: SIM",
      "Resultado Correto (Placar Exato)"
    ]
  }
];

interface MarketSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function MarketSelector({ value, onChange, className = "" }: MarketSelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`flex h-10 w-full rounded-md border border-[#33b864]/20 bg-[#121212] px-3 py-2 text-sm text-white ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-[#33b864]/50 disabled:cursor-not-allowed disabled:opacity-50 transition-colors ${className}`}
      data-testid="market-selector"
    >
      <option value="" className="bg-[#0a0a0a] text-gray-400">
        Selecione um mercado...
      </option>
      {MARKET_OPTIONS.map((group) => (
        <optgroup 
          key={group.label} 
          label={group.label}
          className="bg-[#0a0a0a] text-[#33b864] font-bold"
        >
          {group.options.map((option) => (
            <option 
              key={option} 
              value={option}
              className="bg-[#121212] text-white py-1 hover:bg-[#33b864]/10"
            >
              {option}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}

// Export market options for use in other components if needed
export { MARKET_OPTIONS };
