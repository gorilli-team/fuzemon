import { Order, ApiResponse, PaginatedResponse } from "../types/order";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

class ApiService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Order API methods
  async createOrder(
    orderData: Omit<Order, "id" | "createdAt">
  ): Promise<ApiResponse<Order>> {
    return this.request<ApiResponse<Order>>("/api/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  }

  async getOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    userAddress?: string;
    orderHash?: string;
  }): Promise<PaginatedResponse<Order>> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/api/orders?${queryString}` : "/api/orders";

    return this.request<PaginatedResponse<Order>>(endpoint);
  }

  async getOrderById(id: string): Promise<ApiResponse<Order>> {
    return this.request<ApiResponse<Order>>(`/api/orders/${id}`);
  }

  async updateOrder(
    id: string,
    updateData: Partial<Order>
  ): Promise<ApiResponse<Order>> {
    return this.request<ApiResponse<Order>>(`/api/orders/${id}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    });
  }

  async updateOrderStatus(
    id: string,
    status: string,
    message?: string,
    error?: string
  ): Promise<ApiResponse<Order>> {
    return this.request<ApiResponse<Order>>(`/api/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, message, error }),
    });
  }

  async deleteOrder(id: string): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>(`/api/orders/${id}`, {
      method: "DELETE",
    });
  }

  async getOrdersByUser(
    address: string,
    params?: { page?: number; limit?: number; status?: string }
  ): Promise<PaginatedResponse<Order>> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = queryString
      ? `/api/orders/user/${address}?${queryString}`
      : `/api/orders/user/${address}`;

    return this.request<PaginatedResponse<Order>>(endpoint);
  }

  async getOrderByHash(hash: string): Promise<ApiResponse<Order>> {
    return this.request<ApiResponse<Order>>(`/api/orders/hash/${hash}`);
  }

  // Health check
  async healthCheck(): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>("/health");
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
