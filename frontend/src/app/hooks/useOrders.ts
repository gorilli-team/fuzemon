import { useState, useEffect, useCallback } from "react";
import { Order } from "../types/order";
import { apiService } from "../services/api";

interface UseOrdersOptions {
  userAddress?: string;
  status?: string;
  page?: number;
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseOrdersReturn {
  orders: Order[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  refresh: () => Promise<void>;
  createOrder: (
    orderData: Omit<Order, "id" | "createdAt">
  ) => Promise<Order | null>;
  updateOrder: (
    id: string,
    updateData: Partial<Order>
  ) => Promise<Order | null>;
  updateOrderStatus: (
    id: string,
    status: string,
    message?: string,
    error?: string
  ) => Promise<Order | null>;
  deleteOrder: (id: string) => Promise<boolean>;
  clearError: () => void;
}

export function useOrders(options: UseOrdersOptions = {}): UseOrdersReturn {
  const {
    userAddress,
    status,
    page = 1,
    limit = 20,
    autoRefresh = true,
    refreshInterval = 5000,
  } = options;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (userAddress) {
        response = await apiService.getOrdersByUser(userAddress, {
          page,
          limit,
          status,
        });
      } else {
        response = await apiService.getOrders({
          page,
          limit,
          status,
        });
      }

      if (response.success && response.data) {
        setOrders(response.data);
        setPagination(response.pagination);
      } else {
        setError("Failed to load orders");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load orders";
      setError(errorMessage);
      console.error("Error loading orders:", err);
    } finally {
      setLoading(false);
    }
  }, [userAddress, status, page, limit]);

  const refresh = useCallback(async () => {
    await loadOrders();
  }, [loadOrders]);

  const createOrder = useCallback(
    async (
      orderData: Omit<Order, "id" | "createdAt">
    ): Promise<Order | null> => {
      try {
        setError(null);
        const response = await apiService.createOrder(orderData);

        if (response.success && response.data) {
          // Add the new order to the current list
          setOrders((prev) => [response.data!, ...prev]);
          return response.data;
        } else {
          setError("Failed to create order");
          return null;
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create order";
        setError(errorMessage);
        console.error("Error creating order:", err);
        return null;
      }
    },
    []
  );

  const updateOrder = useCallback(
    async (id: string, updateData: Partial<Order>): Promise<Order | null> => {
      try {
        setError(null);
        const response = await apiService.updateOrder(id, updateData);

        if (response.success && response.data) {
          // Update the order in the current list
          setOrders((prev) =>
            prev.map((order) => (order.id === id ? response.data! : order))
          );
          return response.data;
        } else {
          setError("Failed to update order");
          return null;
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update order";
        setError(errorMessage);
        console.error("Error updating order:", err);
        return null;
      }
    },
    []
  );

  const updateOrderStatus = useCallback(
    async (
      id: string,
      status: string,
      message?: string,
      error?: string
    ): Promise<Order | null> => {
      try {
        setError(null);
        const response = await apiService.updateOrderStatus(
          id,
          status,
          message,
          error
        );

        if (response.success && response.data) {
          // Update the order in the current list
          setOrders((prev) =>
            prev.map((order) => (order.id === id ? response.data! : order))
          );
          return response.data;
        } else {
          setError("Failed to update order status");
          return null;
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update order status";
        setError(errorMessage);
        console.error("Error updating order status:", err);
        return null;
      }
    },
    []
  );

  const deleteOrder = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);
      const response = await apiService.deleteOrder(id);

      if (response.success) {
        // Remove the order from the current list
        setOrders((prev) => prev.filter((order) => order.id !== id));
        return true;
      } else {
        setError("Failed to delete order");
        return false;
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete order";
      setError(errorMessage);
      console.error("Error deleting order:", err);
      return false;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load orders on mount and when dependencies change
  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadOrders();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loadOrders]);

  return {
    orders,
    loading,
    error,
    pagination,
    refresh,
    createOrder,
    updateOrder,
    updateOrderStatus,
    deleteOrder,
    clearError,
  };
}
