import { useState, useEffect } from 'react';
import { Activity, Brain, Database, Zap } from 'lucide-react';

// Separated leagues with their respective teams
const LEAGUES_DATA = {
  'Liga Inglesa': ['Manchester City', 'Arsenal', 'Liverpool', 'Chelsea', 'Tottenham', 'Man United'],
  'Campeonato Espanhol': ['Real Madrid', 'Barcelona', 'Atlético Madrid', 'Sevilla', 'Valencia'],
  'Série A Italiana': ['Inter de Milão', 'AC Milan', 'Juventus', 'Napoli', 'Roma'],
  'Bundesliga': ['Bayern Munique', 'Borussia Dortmund', 'RB Leipzig', 'Bayer Leverkusen'],
  'Liga Francesa': ['Paris SG', 'Olympique Marseille', 'Lyon', 'Monaco'],
  'Brasileirão': ['Flamengo', 'Palmeiras', 'São Paulo', 'Corinthians', 'Atlético-MG', 'Fluminense'],
  'Liga dos Campeões': ['Bayern Munique', 'Real Madrid', 'Manchester City', 'Barcelona', 'Liverpool']
};

const MARKETS = ['Mais de 0.5 gols 1T', 'Ambas Marcam', 'Mais de 1.5 gols', 'Vitória Casa', 'Empate Anula', 'Handicap Asiático'];

interface ScanLine {
  id: string;
  text: string;
  timestamp: number;
}

export function AIScanner() {
  const [lines, setLines] = useState<ScanLine[]>([]);
  const [analyzing, setAnalyzing] = useState(0);

  useEffect(() => {
    const addLine = () => {
      // Pick a random league
      const leagueNames = Object.keys(LEAGUES_DATA);
      const selectedLeague = leagueNames[Math.floor(Math.random() * leagueNames.length)];
      const leagueTeams = LEAGUES_DATA[selectedLeague as keyof typeof LEAGUES_DATA];
      
      // Pick two different teams from the SAME league
      const team1Index = Math.floor(Math.random() * leagueTeams.length);
      let team2Index = Math.floor(Math.random() * leagueTeams.length);
      while (team2Index === team1Index) {
        team2Index = Math.floor(Math.random() * leagueTeams.length);
      }
      
      const templates = [
        `Varrendo partidas ${selectedLeague}...`,
        `Avaliando mercado ${MARKETS[Math.floor(Math.random() * MARKETS.length)]}...`,
        `Processando dados de cotações ao vivo...`,
        `Confiança IA: ${(85 + Math.random() * 12).toFixed(1)}% - Sinal detectado`,
        `Validação cruzada com especialistas...`,
        `Convergência do modelo estatístico: ${(92 + Math.random() * 7).toFixed(1)}%`,
        `Reconhecimento de padrões: ${Math.floor(Math.random() * 15) + 5} oportunidades`,
      ];

      const newLine: ScanLine = {
        id: `line-${Date.now()}-${Math.random()}`,
        text: templates[Math.floor(Math.random() * templates.length)],
        timestamp: Date.now(),
      };

      setLines(prev => [newLine, ...prev].slice(0, 8));
    };

    const interval = setInterval(addLine, 1800);
    const analyzeInterval = setInterval(() => {
      setAnalyzing(prev => (prev + 1) % 4);
    }, 500);

    // Add initial lines and store timeout IDs for cleanup
    const initialTimeouts: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < 5; i++) {
      initialTimeouts.push(setTimeout(addLine, i * 400));
    }

    return () => {
      clearInterval(interval);
      clearInterval(analyzeInterval);
      initialTimeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  return (
    <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-4 overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary animate-pulse" />
          <h3 className="text-[10px] font-bold text-white uppercase tracking-wide whitespace-nowrap">
            SCANNER PROCURANDO ALTAS PROBABILIDADES
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
          <span className="text-[9px] text-primary font-mono">AO VIVO</span>
        </div>
      </div>

      <div className="space-y-1.5 font-mono text-[10px] h-[180px] overflow-hidden">
        {lines.map((line, idx) => (
          <div
            key={line.id}
            className="text-primary/60 transition-all duration-300 animate-scan-in"
            style={{
              opacity: 1 - (idx * 0.12),
              transform: `translateY(${idx * 0}px)`,
            }}
          >
            <span className="text-primary/40">{'>'}</span> {line.text}
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-[#222] flex items-center justify-between text-[9px]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Database className="w-3 h-3 text-primary/60" />
            <span className="text-muted-foreground">{Math.floor(Math.random() * 200) + 1200} jogos</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-primary/60" />
            <span className="text-muted-foreground">{(Math.random() * 5 + 15).toFixed(1)}ms</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Activity className="w-3 h-3 text-primary" />
          <span className="text-primary font-semibold">Processando</span>
        </div>
      </div>
    </div>
  );
}
