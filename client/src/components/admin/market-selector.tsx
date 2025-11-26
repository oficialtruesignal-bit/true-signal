// MarketSelector - Standardized Betting Market Selector
// Prevents typos and ensures consistent market naming

interface MarketGroup {
  label: string;
  options: string[];
}

const MARKET_OPTIONS: MarketGroup[] = [
  {
    label: "🎯 MÚLTIPLAS",
    options: [
      "Múltipla Simples",
      "Múltipla Combinada"
    ]
  },
  {
    label: "Resultado Final",
    options: [
      "Vitória Casa (1)",
      "Empate (X)",
      "Vitória Visitante (2)",
      "Dupla Chance: 1X (Casa ou Empate)",
      "Dupla Chance: 12 (Casa ou Visitante)",
      "Dupla Chance: X2 (Empate ou Visitante)",
      "Empate Anula (DNB) Casa",
      "Empate Anula (DNB) Visitante",
      "Vitória com Handicap Europeu Casa -1",
      "Vitória com Handicap Europeu Casa -2",
      "Vitória com Handicap Europeu Visitante -1",
      "Vitória com Handicap Europeu Visitante -2"
    ]
  },
  {
    label: "Gols - Over/Under (Total)",
    options: [
      "Mais de 0.5 Gols",
      "Mais de 1.5 Gols",
      "Mais de 2.5 Gols",
      "Mais de 3.5 Gols",
      "Mais de 4.5 Gols",
      "Mais de 5.5 Gols",
      "Menos de 0.5 Gols",
      "Menos de 1.5 Gols",
      "Menos de 2.5 Gols",
      "Menos de 3.5 Gols",
      "Menos de 4.5 Gols",
      "Menos de 5.5 Gols",
      "Exatamente 0 Gols",
      "Exatamente 1 Gol",
      "Exatamente 2 Gols",
      "Exatamente 3 Gols",
      "Exatamente 4 Gols"
    ]
  },
  {
    label: "Ambas Marcam (BTTS)",
    options: [
      "Ambas Marcam: SIM",
      "Ambas Marcam: NÃO",
      "Ambas Marcam 1T: SIM",
      "Ambas Marcam 1T: NÃO",
      "Ambas Marcam 2T: SIM",
      "Ambas Marcam 2T: NÃO"
    ]
  },
  {
    label: "Gols - Casa/Visitante",
    options: [
      "Casa - Mais de 0.5 Gols",
      "Casa - Mais de 1.5 Gols",
      "Casa - Mais de 2.5 Gols",
      "Casa - Mais de 3.5 Gols",
      "Casa - Menos de 0.5 Gols",
      "Casa - Menos de 1.5 Gols",
      "Casa - Menos de 2.5 Gols",
      "Visitante - Mais de 0.5 Gols",
      "Visitante - Mais de 1.5 Gols",
      "Visitante - Mais de 2.5 Gols",
      "Visitante - Mais de 3.5 Gols",
      "Visitante - Menos de 0.5 Gols",
      "Visitante - Menos de 1.5 Gols",
      "Visitante - Menos de 2.5 Gols",
      "Casa Marcar em Ambos Tempos",
      "Visitante Marcar em Ambos Tempos"
    ]
  },
  {
    label: "Handicap Asiático",
    options: [
      "Handicap Asiático Casa 0.0",
      "Handicap Asiático Casa -0.25",
      "Handicap Asiático Casa -0.5",
      "Handicap Asiático Casa -0.75",
      "Handicap Asiático Casa -1.0",
      "Handicap Asiático Casa -1.25",
      "Handicap Asiático Casa -1.5",
      "Handicap Asiático Casa -1.75",
      "Handicap Asiático Casa -2.0",
      "Handicap Asiático Casa -2.25",
      "Handicap Asiático Casa -2.5",
      "Handicap Asiático Visitante 0.0",
      "Handicap Asiático Visitante +0.25",
      "Handicap Asiático Visitante +0.5",
      "Handicap Asiático Visitante +0.75",
      "Handicap Asiático Visitante +1.0",
      "Handicap Asiático Visitante +1.25",
      "Handicap Asiático Visitante +1.5",
      "Handicap Asiático Visitante +1.75",
      "Handicap Asiático Visitante +2.0",
      "Handicap Asiático Visitante +2.25",
      "Handicap Asiático Visitante +2.5"
    ]
  },
  {
    label: "Over/Under Asiático",
    options: [
      "Asiático Mais de 0.5",
      "Asiático Mais de 0.75",
      "Asiático Mais de 1.0",
      "Asiático Mais de 1.25",
      "Asiático Mais de 1.5",
      "Asiático Mais de 1.75",
      "Asiático Mais de 2.0",
      "Asiático Mais de 2.25",
      "Asiático Mais de 2.5",
      "Asiático Mais de 2.75",
      "Asiático Mais de 3.0",
      "Asiático Mais de 3.25",
      "Asiático Mais de 3.5",
      "Asiático Mais de 3.75",
      "Asiático Mais de 4.0",
      "Asiático Menos de 0.5",
      "Asiático Menos de 0.75",
      "Asiático Menos de 1.0",
      "Asiático Menos de 1.25",
      "Asiático Menos de 1.5",
      "Asiático Menos de 1.75",
      "Asiático Menos de 2.0",
      "Asiático Menos de 2.25",
      "Asiático Menos de 2.5",
      "Asiático Menos de 2.75",
      "Asiático Menos de 3.0",
      "Asiático Menos de 3.25",
      "Asiático Menos de 3.5",
      "Asiático Menos de 3.75",
      "Asiático Menos de 4.0"
    ]
  },
  {
    label: "1º Tempo - Resultado",
    options: [
      "1T - Vitória Casa",
      "1T - Empate",
      "1T - Vitória Visitante",
      "1T - Dupla Chance: 1X",
      "1T - Dupla Chance: 12",
      "1T - Dupla Chance: X2"
    ]
  },
  {
    label: "1º Tempo - Gols",
    options: [
      "1T - Mais de 0.5 Gols",
      "1T - Mais de 1.5 Gols",
      "1T - Mais de 2.5 Gols",
      "1T - Menos de 0.5 Gols",
      "1T - Menos de 1.5 Gols",
      "1T - Menos de 2.5 Gols",
      "1T - Casa Mais de 0.5",
      "1T - Casa Mais de 1.5",
      "1T - Visitante Mais de 0.5",
      "1T - Visitante Mais de 1.5"
    ]
  },
  {
    label: "2º Tempo - Resultado",
    options: [
      "2T - Vitória Casa",
      "2T - Empate",
      "2T - Vitória Visitante",
      "2T - Dupla Chance: 1X",
      "2T - Dupla Chance: 12",
      "2T - Dupla Chance: X2"
    ]
  },
  {
    label: "2º Tempo - Gols",
    options: [
      "2T - Mais de 0.5 Gols",
      "2T - Mais de 1.5 Gols",
      "2T - Mais de 2.5 Gols",
      "2T - Menos de 0.5 Gols",
      "2T - Menos de 1.5 Gols",
      "2T - Menos de 2.5 Gols",
      "2T - Casa Mais de 0.5",
      "2T - Casa Mais de 1.5",
      "2T - Visitante Mais de 0.5",
      "2T - Visitante Mais de 1.5"
    ]
  },
  {
    label: "Resultado HT/FT",
    options: [
      "HT/FT: Casa/Casa",
      "HT/FT: Casa/Empate",
      "HT/FT: Casa/Visitante",
      "HT/FT: Empate/Casa",
      "HT/FT: Empate/Empate",
      "HT/FT: Empate/Visitante",
      "HT/FT: Visitante/Casa",
      "HT/FT: Visitante/Empate",
      "HT/FT: Visitante/Visitante"
    ]
  },
  {
    label: "Escanteios - Total",
    options: [
      "Mais de 6.5 Escanteios",
      "Mais de 7.5 Escanteios",
      "Mais de 8.5 Escanteios",
      "Mais de 9.5 Escanteios",
      "Mais de 10.5 Escanteios",
      "Mais de 11.5 Escanteios",
      "Mais de 12.5 Escanteios",
      "Menos de 6.5 Escanteios",
      "Menos de 7.5 Escanteios",
      "Menos de 8.5 Escanteios",
      "Menos de 9.5 Escanteios",
      "Menos de 10.5 Escanteios",
      "Menos de 11.5 Escanteios",
      "Menos de 12.5 Escanteios"
    ]
  },
  {
    label: "Escanteios - Casa/Visitante",
    options: [
      "Casa - Mais de 3.5 Escanteios",
      "Casa - Mais de 4.5 Escanteios",
      "Casa - Mais de 5.5 Escanteios",
      "Casa - Mais de 6.5 Escanteios",
      "Casa - Menos de 3.5 Escanteios",
      "Casa - Menos de 4.5 Escanteios",
      "Casa - Menos de 5.5 Escanteios",
      "Visitante - Mais de 3.5 Escanteios",
      "Visitante - Mais de 4.5 Escanteios",
      "Visitante - Mais de 5.5 Escanteios",
      "Visitante - Mais de 6.5 Escanteios",
      "Visitante - Menos de 3.5 Escanteios",
      "Visitante - Menos de 4.5 Escanteios",
      "Visitante - Menos de 5.5 Escanteios"
    ]
  },
  {
    label: "Escanteios - 1º Tempo",
    options: [
      "1T - Mais de 3.5 Escanteios",
      "1T - Mais de 4.5 Escanteios",
      "1T - Mais de 5.5 Escanteios",
      "1T - Mais de 6.5 Escanteios",
      "1T - Menos de 3.5 Escanteios",
      "1T - Menos de 4.5 Escanteios",
      "1T - Menos de 5.5 Escanteios",
      "1T - Casa Mais de 2.5 Escanteios",
      "1T - Casa Mais de 3.5 Escanteios",
      "1T - Visitante Mais de 2.5 Escanteios",
      "1T - Visitante Mais de 3.5 Escanteios"
    ]
  },
  {
    label: "Escanteios - Especiais",
    options: [
      "Handicap Asiático Escanteios Casa -2.5",
      "Handicap Asiático Escanteios Casa -3.5",
      "Handicap Asiático Escanteios Visitante +2.5",
      "Handicap Asiático Escanteios Visitante +3.5",
      "Próximo Escanteio: Casa",
      "Próximo Escanteio: Visitante",
      "Último Escanteio: Casa",
      "Último Escanteio: Visitante",
      "Corrida para 5 Escanteios: Casa",
      "Corrida para 5 Escanteios: Visitante",
      "Corrida para 7 Escanteios: Casa",
      "Corrida para 7 Escanteios: Visitante",
      "Corrida para 9 Escanteios: Casa",
      "Corrida para 9 Escanteios: Visitante"
    ]
  },
  {
    label: "Cartões - Total",
    options: [
      "Mais de 1.5 Cartões",
      "Mais de 2.5 Cartões",
      "Mais de 3.5 Cartões",
      "Mais de 4.5 Cartões",
      "Mais de 5.5 Cartões",
      "Mais de 6.5 Cartões",
      "Menos de 2.5 Cartões",
      "Menos de 3.5 Cartões",
      "Menos de 4.5 Cartões",
      "Menos de 5.5 Cartões",
      "Cartão Vermelho: SIM",
      "Cartão Vermelho: NÃO"
    ]
  },
  {
    label: "Cartões - Casa/Visitante",
    options: [
      "Casa - Mais de 1.5 Cartões",
      "Casa - Mais de 2.5 Cartões",
      "Casa - Mais de 3.5 Cartões",
      "Casa - Menos de 1.5 Cartões",
      "Casa - Menos de 2.5 Cartões",
      "Visitante - Mais de 1.5 Cartões",
      "Visitante - Mais de 2.5 Cartões",
      "Visitante - Mais de 3.5 Cartões",
      "Visitante - Menos de 1.5 Cartões",
      "Visitante - Menos de 2.5 Cartões",
      "Ambas Equipes Levam Cartão: SIM",
      "Ambas Equipes Levam Cartão: NÃO"
    ]
  },
  {
    label: "Chutes ao Gol - Total",
    options: [
      "Mais de 7.5 Chutes no Gol",
      "Mais de 8.5 Chutes no Gol",
      "Mais de 9.5 Chutes no Gol",
      "Mais de 10.5 Chutes no Gol",
      "Mais de 11.5 Chutes no Gol",
      "Menos de 7.5 Chutes no Gol",
      "Menos de 8.5 Chutes no Gol",
      "Menos de 9.5 Chutes no Gol",
      "Menos de 10.5 Chutes no Gol"
    ]
  },
  {
    label: "Chutes ao Gol - Casa/Visitante",
    options: [
      "Casa - Mais de 3.5 Chutes no Gol",
      "Casa - Mais de 4.5 Chutes no Gol",
      "Casa - Mais de 5.5 Chutes no Gol",
      "Casa - Mais de 6.5 Chutes no Gol",
      "Casa - Menos de 3.5 Chutes no Gol",
      "Casa - Menos de 4.5 Chutes no Gol",
      "Visitante - Mais de 3.5 Chutes no Gol",
      "Visitante - Mais de 4.5 Chutes no Gol",
      "Visitante - Mais de 5.5 Chutes no Gol",
      "Visitante - Mais de 6.5 Chutes no Gol",
      "Visitante - Menos de 3.5 Chutes no Gol",
      "Visitante - Menos de 4.5 Chutes no Gol"
    ]
  },
  {
    label: "Placar Exato",
    options: [
      "Placar Exato: 0-0",
      "Placar Exato: 1-0",
      "Placar Exato: 2-0",
      "Placar Exato: 2-1",
      "Placar Exato: 3-0",
      "Placar Exato: 3-1",
      "Placar Exato: 3-2",
      "Placar Exato: 0-1",
      "Placar Exato: 0-2",
      "Placar Exato: 1-2",
      "Placar Exato: 0-3",
      "Placar Exato: 1-3",
      "Placar Exato: 2-3",
      "Placar Exato: 1-1",
      "Placar Exato: 2-2",
      "Placar Exato: 3-3",
      "Placar Exato: Outro"
    ]
  },
  {
    label: "Margem de Vitória",
    options: [
      "Casa Vence por 1 Gol",
      "Casa Vence por 2 Gols",
      "Casa Vence por 3+ Gols",
      "Visitante Vence por 1 Gol",
      "Visitante Vence por 2 Gols",
      "Visitante Vence por 3+ Gols",
      "Qualquer Time Vence por 1 Gol",
      "Qualquer Time Vence por 2 Gols",
      "Qualquer Time Vence por 3+ Gols"
    ]
  },
  {
    label: "Quando Marcar - Minutos",
    options: [
      "Gol nos Primeiros 10 Minutos",
      "Gol entre 10-20 Minutos",
      "Gol entre 20-30 Minutos",
      "Gol entre 30-HT Minutos",
      "Gol entre HT-60 Minutos",
      "Gol entre 60-70 Minutos",
      "Gol entre 70-80 Minutos",
      "Gol entre 80-FT Minutos",
      "Gol nos Últimos 10 Minutos"
    ]
  },
  {
    label: "Intervalo de Gols",
    options: [
      "0-1 Gols no Jogo",
      "2-3 Gols no Jogo",
      "4-5 Gols no Jogo",
      "6+ Gols no Jogo",
      "Casa 0-1 Gols",
      "Casa 2-3 Gols",
      "Casa 4+ Gols",
      "Visitante 0-1 Gols",
      "Visitante 2-3 Gols",
      "Visitante 4+ Gols"
    ]
  },
  {
    label: "Vitória Limpa",
    options: [
      "Casa Win to Nil (Vencer Sem Levar Gol)",
      "Visitante Win to Nil (Vencer Sem Levar Gol)",
      "Qualquer Time Win to Nil",
      "Nenhum Time Win to Nil"
    ]
  },
  {
    label: "Ambos os Tempos",
    options: [
      "Casa Vence Ambos os Tempos",
      "Visitante Vence Ambos os Tempos",
      "Casa Não Perde Nenhum Tempo",
      "Visitante Não Perde Nenhum Tempo",
      "Mesmo Vencedor HT e FT"
    ]
  },
  {
    label: "Par/Ímpar",
    options: [
      "Total de Gols: Par",
      "Total de Gols: Ímpar",
      "Casa Gols: Par",
      "Casa Gols: Ímpar",
      "Visitante Gols: Par",
      "Visitante Gols: Ímpar"
    ]
  },
  {
    label: "Jogador - Gols",
    options: [
      "Jogador Marcar a Qualquer Momento",
      "Jogador Marcar Primeiro Gol",
      "Jogador Marcar Último Gol",
      "Jogador Marcar 2+ Gols",
      "Jogador Marcar Hat-trick (3+ Gols)",
      "Jogador Não Marcar"
    ]
  },
  {
    label: "Jogador - Assistências",
    options: [
      "Jogador Dar Assistência",
      "Jogador Dar 2+ Assistências",
      "Jogador Marcar e Assistir"
    ]
  },
  {
    label: "Jogador - Chutes",
    options: [
      "Jogador Mais de 0.5 Chutes no Gol",
      "Jogador Mais de 1.5 Chutes no Gol",
      "Jogador Mais de 2.5 Chutes no Gol",
      "Jogador Mais de 3.5 Chutes no Gol",
      "Jogador Mais de 0.5 Chutes (Total)",
      "Jogador Mais de 1.5 Chutes (Total)",
      "Jogador Mais de 2.5 Chutes (Total)",
      "Jogador Mais de 3.5 Chutes (Total)"
    ]
  },
  {
    label: "Jogador - Cartões",
    options: [
      "Jogador Levar Cartão Amarelo",
      "Jogador Levar Cartão Vermelho",
      "Jogador Levar Qualquer Cartão",
      "Jogador Não Levar Cartão"
    ]
  },
  {
    label: "Goleiro - Defesas",
    options: [
      "Goleiro Mais de 2.5 Defesas",
      "Goleiro Mais de 3.5 Defesas",
      "Goleiro Mais de 4.5 Defesas",
      "Goleiro Mais de 5.5 Defesas",
      "Goleiro Sofrer Gol: SIM",
      "Goleiro Sofrer Gol: NÃO (Clean Sheet)"
    ]
  },
  {
    label: "Especiais - Combos",
    options: [
      "Vitória Casa + Over 1.5",
      "Vitória Casa + Over 2.5",
      "Vitória Casa + BTTS",
      "Vitória Visitante + Over 1.5",
      "Vitória Visitante + Over 2.5",
      "Vitória Visitante + BTTS",
      "Empate + Under 2.5",
      "BTTS + Over 2.5",
      "BTTS + Over 3.5",
      "Qualquer Time Vencer + Over 2.5"
    ]
  },
  {
    label: "Especiais - Tempo com Mais Gols",
    options: [
      "Tempo com Mais Gols: 1º Tempo",
      "Tempo com Mais Gols: 2º Tempo",
      "Tempos com Mesma Quantidade de Gols",
      "Casa Marcar Mais no 1T",
      "Casa Marcar Mais no 2T",
      "Visitante Marcar Mais no 1T",
      "Visitante Marcar Mais no 2T"
    ]
  },
  {
    label: "Especiais - Pênaltis",
    options: [
      "Pênalti no Jogo: SIM",
      "Pênalti no Jogo: NÃO",
      "Pênalti Convertido: SIM",
      "Pênalti Perdido: SIM"
    ]
  },
  {
    label: "Especiais - Gol Contra",
    options: [
      "Gol Contra no Jogo: SIM",
      "Gol Contra no Jogo: NÃO"
    ]
  },
  {
    label: "Especiais - VAR",
    options: [
      "VAR Usado no Jogo: SIM",
      "VAR Usado no Jogo: NÃO",
      "Gol Anulado por VAR: SIM"
    ]
  },
  {
    label: "Especiais - Substituições",
    options: [
      "Mais de 4.5 Substituições",
      "Mais de 5.5 Substituições",
      "Menos de 4.5 Substituições",
      "Casa Fazer 3 Substituições",
      "Visitante Fazer 3 Substituições"
    ]
  },
  {
    label: "Especiais - Lesões",
    options: [
      "Mais de 2.5 Minutos de Acréscimo 1T",
      "Mais de 3.5 Minutos de Acréscimo 1T",
      "Mais de 4.5 Minutos de Acréscimo 2T",
      "Mais de 5.5 Minutos de Acréscimo 2T"
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
    <div className="relative">
      <select
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`flex h-10 w-full rounded-xl border border-[#33b864]/30 bg-[#121212] px-4 py-3 text-sm text-white appearance-none focus:outline-none focus:border-[#33b864] focus:ring-1 focus:ring-[#33b864] disabled:cursor-not-allowed disabled:opacity-50 transition-all ${className}`}
        data-testid="market-selector"
      >
        <option value="" disabled className="bg-[#0a0a0a] text-gray-400">
          Selecione o mercado da aposta...
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
      
      {/* Ícone de seta customizado */}
      <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </div>
    </div>
  );
}

// Export market options for use in other components if needed
export { MARKET_OPTIONS };
