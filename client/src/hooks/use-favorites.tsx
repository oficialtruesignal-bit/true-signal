import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import { toast } from "sonner";

interface Favorite {
  id: number;
  userId: string;
  tipId: string;
  createdAt: string;
}

export function useFavorites() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;

  const { data: favorites = [], isLoading } = useQuery<Favorite[]>({
    queryKey: ['favorites', userId],
    queryFn: async () => {
      if (!userId) return [];
      const response = await fetch(`/api/favorites/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch favorites');
      const data = await response.json();
      return data.favorites;
    },
    enabled: !!userId,
  });

  const addFavorite = useMutation({
    mutationFn: async (tipId: string) => {
      if (!userId) throw new Error('User not authenticated');
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, tipId }),
      });
      if (!response.ok) throw new Error('Failed to add favorite');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', userId] });
      toast.success('Adicionado aos favoritos!');
    },
    onError: () => {
      toast.error('Erro ao favoritar');
    },
  });

  const removeFavorite = useMutation({
    mutationFn: async (tipId: string) => {
      if (!userId) throw new Error('User not authenticated');
      const response = await fetch(`/api/favorites/${userId}/${tipId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to remove favorite');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', userId] });
      toast.success('Removido dos favoritos');
    },
    onError: () => {
      toast.error('Erro ao remover');
    },
  });

  const isFavorite = (tipId: string) => {
    return favorites.some(fav => fav.tipId === tipId);
  };

  const toggleFavorite = async (tipId: string) => {
    if (isFavorite(tipId)) {
      await removeFavorite.mutateAsync(tipId);
    } else {
      await addFavorite.mutateAsync(tipId);
    }
  };

  return {
    favorites,
    isLoading,
    isFavorite,
    toggleFavorite,
    addFavorite: addFavorite.mutate,
    removeFavorite: removeFavorite.mutate,
    isPending: addFavorite.isPending || removeFavorite.isPending,
  };
}
