import { useQueryClient } from "@tanstack/react-query";
import {
  useGetCart,
  useAddCartItem,
  useUpdateCartItem,
  useRemoveCartItem,
  getGetCartQueryKey,
} from "@workspace/api-client-react";
import { getSessionId } from "@/lib/session";
import { toast } from "sonner";

export function useCart() {
  const queryClient = useQueryClient();
  const sessionId = getSessionId();

  const cartQuery = useGetCart(
    { sessionId },
    { query: { enabled: !!sessionId, queryKey: getGetCartQueryKey({ sessionId }) } }
  );

  const addMutation = useAddCartItem({
    mutation: {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey({ sessionId }) });
        toast.success("Added to cart", {
        });
      },
    },
  });

  const updateMutation = useUpdateCartItem({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey({ sessionId }) });
      },
    },
  });

  const removeMutation = useRemoveCartItem({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey({ sessionId }) });
      },
    },
  });

  return {
    cart: cartQuery.data,
    isLoading: cartQuery.isLoading,
    addItem: (productId: string, quantity: number = 1) =>
      addMutation.mutate({ data: { sessionId, productId, quantity } }),
    updateItemQuantity: (itemId: string, quantity: number) =>
      updateMutation.mutate({ itemId, data: { sessionId, quantity } }),
    removeItem: (itemId: string) =>
      removeMutation.mutate({ itemId, params: { sessionId } }),
    isAdding: addMutation.isPending,
  };
}
