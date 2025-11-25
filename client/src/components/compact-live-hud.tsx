import { useState, useEffect } from 'react';
import { Users, Ticket } from 'lucide-react';

export function CompactLiveHud() {
  const [assertivityValue, setAssertivityValue] = useState(89.0);

  useEffect(() => {
    const interval = setInterval(() => {
      // Gera um número aleatório entre -3.0 e +3.0
      const variation = (Math.random() * 6) - 3; 
      // Aplica ao base 89, mantendo entre 86 e 92
      let newValue = 89 + variation;
      // Trava os limites por segurança
      if (newValue > 92) newValue = 92;
      if (newValue < 86) newValue = 86;
      
      setAssertivityValue(newValue);
    }, 3000); // Atualiza a cada 3 segundos

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-6 py-6">

      {/* --- MEDIDOR SEGMENTADO DE ASSERTIVIDADE --- */}
      <div className="relative flex items-center justify-center py-6" data-testid="hud-assertivity">
        {/* Container do Gauge */}
        <div className="relative w-48 h-48 md:w-56 md:h-56">
          
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {Array.from({ length: 60 }).map((_, i) => {
              // Lógica de Cor: Se o índice for menor que o ativo, é VERDE. Senão, é CINZA ESCURO.
              const isActive = i < Math.round((assertivityValue / 100) * 60);
              const color = isActive ? "#33b864" : "#222222"; 
              
              return (
                <line
                  key={i}
                  x1="50" y1="2" x2="50" y2="12"
                  stroke={color}
                  strokeWidth="2.5"
                  transform={`rotate(${i * (360 / 60)} 50 50)`}
                  style={{ transition: 'stroke 0.5s ease' }}
                />
              );
            })}
          </svg>

          {/* Conteúdo Central (Texto) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <div className="flex items-baseline">
              <span className="text-5xl md:text-6xl font-sora font-bold text-white tracking-tighter">
                {assertivityValue.toFixed(1)}
              </span>
              <span className="text-xl md:text-2xl font-sora text-[#33b864] font-bold ml-1">%</span>
            </div>
            <span className="text-xs text-gray-500 uppercase tracking-[0.2em] mt-1 font-medium font-inter">
              Assertividade
            </span>
          </div>

        </div>
      </div>

    </div>
  );
}
