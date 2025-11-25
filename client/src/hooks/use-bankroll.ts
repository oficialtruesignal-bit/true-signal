import { useQuery } from '@tanstack/react-query';
import { tipsService } from '@/lib/tips-service';

const INITIAL_BANKROLL = 1000; // R$ 1.000,00
const UNIT_VALUE = 100; // R$ 100,00 por aposta

export interface BankrollStats {
  initialBankroll: number;
  unitValue: number;
  totalProfit: number;
  totalProfitUnits: number;
  currentBankroll: number;
  greenCount: number;
  redCount: number;
  pendingCount: number;
  totalTips: number;
  monthTips: number;
  averageOdd: number;
}

export function useBankroll(): BankrollStats {
  const { data: tips = [] } = useQuery({
    queryKey: ['tips'],
    queryFn: tipsService.getAll,
  });

  // Calcula lucro total baseado nas tips reais
  let totalProfit = 0;
  let greenCount = 0;
  let redCount = 0;
  let pendingCount = 0;

  tips.forEach((tip) => {
    if (tip.status === 'green') {
      // Lucro = Unit * (odd - 1)
      totalProfit += UNIT_VALUE * (tip.odd - 1);
      greenCount++;
    } else if (tip.status === 'red') {
      // Perda = -Unit
      totalProfit -= UNIT_VALUE;
      redCount++;
    } else if (tip.status === 'pending') {
      pendingCount++;
    }
  });

  const totalProfitUnits = totalProfit / UNIT_VALUE;
  const currentBankroll = INITIAL_BANKROLL + totalProfit;

  // Calcula odd média de TODOS os sinais com odd válida
  const tipsWithValidOdd = tips.filter(tip => tip.odd != null && !isNaN(tip.odd));
  const averageOdd = tipsWithValidOdd.length > 0
    ? tipsWithValidOdd.reduce((sum, tip) => sum + tip.odd, 0) / tipsWithValidOdd.length
    : 0;

  // Conta sinais do mês atual
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const monthTips = tips.filter(tip => {
    const tipDate = new Date(tip.timestamp);
    return tipDate >= monthStart;
  }).length;

  return {
    initialBankroll: INITIAL_BANKROLL,
    unitValue: UNIT_VALUE,
    totalProfit,
    totalProfitUnits,
    currentBankroll,
    greenCount,
    redCount,
    pendingCount,
    totalTips: tips.length,
    monthTips,
    averageOdd,
  };
}
