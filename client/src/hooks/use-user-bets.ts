import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "./use-auth";

interface UserBet {
  id: string;
  userId: string;
  tipId: string;
  enteredAt: string;
  result: 'pending' | 'green' | 'red';
  resultMarkedAt: string | null;
  stakeUsed: string;
  oddAtEntry: string;
  profit: string | null;
}

interface UserStats {
  greens: number;
  reds: number;
  pending: number;
  profit: number;
  totalBets: number;
  assertivity: number;
  monthName: string;
}

export function useUserBets() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: userBets = [], isLoading: betsLoading } = useQuery<UserBet[]>({
    queryKey: ['user-bets', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await axios.get(`/api/user-bets/${user.id}`);
      return response.data.bets || [];
    },
    enabled: !!user?.id,
  });

  const { data: stats, isLoading: statsLoading } = useQuery<UserStats>({
    queryKey: ['user-bets-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const response = await axios.get(`/api/user-bets/stats/${user.id}`);
      return response.data;
    },
    enabled: !!user?.id,
  });

  const enterBetMutation = useMutation({
    mutationFn: async ({ tipId, stakeUsed, oddAtEntry }: { tipId: string; stakeUsed: string; oddAtEntry: string }) => {
      if (!user?.id) throw new Error('User not logged in');
      const response = await axios.post('/api/user-bets', {
        userId: user.id,
        tipId,
        stakeUsed,
        oddAtEntry
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-bets', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['user-bets-stats', user?.id] });
    }
  });

  const markResultMutation = useMutation({
    mutationFn: async ({ tipId, result }: { tipId: string; result: 'green' | 'red' }) => {
      if (!user?.id) throw new Error('User not logged in');
      const response = await axios.patch(`/api/user-bets/${user.id}/${tipId}`, { result });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-bets', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['user-bets-stats', user?.id] });
    }
  });

  const hasEntered = (tipId: string) => {
    return userBets.some(bet => bet.tipId === tipId);
  };

  const getBet = (tipId: string) => {
    return userBets.find(bet => bet.tipId === tipId);
  };

  const enterBet = async (tipId: string, stakeUsed: string, oddAtEntry: string) => {
    return enterBetMutation.mutateAsync({ tipId, stakeUsed, oddAtEntry });
  };

  const markResult = async (tipId: string, result: 'green' | 'red') => {
    return markResultMutation.mutateAsync({ tipId, result });
  };

  return {
    userBets,
    stats,
    hasEntered,
    getBet,
    enterBet,
    markResult,
    isLoading: betsLoading || statsLoading,
    isEntering: enterBetMutation.isPending,
    isMarkingResult: markResultMutation.isPending,
  };
}
