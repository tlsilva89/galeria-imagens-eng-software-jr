import { Gallery, GalleryResponse } from "@/types/gallery";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface ApiError {
  message?: string;
  error?: string;
}

interface CacheItem {
  data: unknown;
  timestamp: number;
}

// Função para determinar se está executando no servidor
const isServer = typeof window === "undefined";

// Função para fazer log de erros de forma consistente
const logError = (context: string, error: unknown) => {
  console.error(`[API Error - ${context}]:`, error);
};

// Cache simples para evitar requisições desnecessárias
const cache = new Map<string, CacheItem>();
const CACHE_DURATION = 30000; // 30 segundos

function getCacheKey(url: string): string {
  return url;
}

function getFromCache<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T;
  }
  return null;
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, timestamp: Date.now() });
}

export const api = {
  async getGalleries(
    page = 1,
    limit = 12,
    status = "all"
  ): Promise<GalleryResponse> {
    const cacheKey = getCacheKey(`gallery-${page}-${limit}-${status}`);

    // Verificar cache primeiro (apenas no cliente)
    if (!isServer) {
      const cached = getFromCache<GalleryResponse>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const url = `${API_BASE_URL}/gallery?page=${page}&limit=${limit}&status=${status}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        ...(isServer ? { next: { revalidate: 60 } } : { cache: "no-store" }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Resposta vazia");
        logError("getGalleries", `HTTP ${response.status}: ${errorText}`);

        const defaultResponse: GalleryResponse = {
          galleries: [],
          pagination: {
            page: 1,
            limit: 12,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
        };

        return defaultResponse;
      }

      const data = await response.json();

      if (!data || typeof data !== "object") {
        throw new Error("Resposta inválida do servidor");
      }

      const responseData: GalleryResponse = {
        galleries: Array.isArray(data.galleries) ? data.galleries : [],
        pagination: data.pagination || {
          page: 1,
          limit: 12,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };

      if (!isServer) {
        setCache(cacheKey, responseData);
      }

      return responseData;
    } catch (error) {
      logError("getGalleries", error);

      return {
        galleries: [],
        pagination: {
          page: 1,
          limit: 12,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    }
  },

  async getGalleryById(id: string): Promise<Gallery> {
    try {
      if (!id || typeof id !== "string") {
        throw new Error("ID da galeria é obrigatório");
      }

      const cacheKey = getCacheKey(`gallery-${id}`);
      if (!isServer) {
        const cached = getFromCache<Gallery>(cacheKey);
        if (cached) {
          return cached;
        }
      }

      const response = await fetch(
        `${API_BASE_URL}/gallery/${encodeURIComponent(id)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          ...(isServer ? { next: { revalidate: 60 } } : { cache: "no-store" }),
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Galeria não encontrada");
        }
        const errorText = await response.text().catch(() => "Resposta vazia");
        logError("getGalleryById", `HTTP ${response.status}: ${errorText}`);
        throw new Error(
          `Erro HTTP ${response.status}: Falha ao buscar galeria`
        );
      }

      const data = await response.json();

      if (!data || !data.id) {
        throw new Error("Dados da galeria inválidos");
      }

      if (!isServer) {
        setCache(cacheKey, data);
      }

      return data;
    } catch (error) {
      logError("getGalleryById", error);
      throw error instanceof Error
        ? error
        : new Error("Erro desconhecido ao buscar galeria");
    }
  },

  async createGallery(formData: FormData): Promise<Gallery> {
    try {
      if (!formData) {
        throw new Error("Dados do formulário são obrigatórios");
      }

      const title = formData.get("title");
      const image = formData.get("image");

      if (!title || typeof title !== "string" || title.trim().length === 0) {
        throw new Error("Título é obrigatório");
      }

      if (!image || !(image instanceof File)) {
        throw new Error("Imagem é obrigatória");
      }

      const response = await fetch(`${API_BASE_URL}/gallery`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = "Erro ao criar galeria";

        try {
          const errorData = (await response.json()) as ApiError;
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          const errorText = await response.text().catch(() => "");
          if (errorText) errorMessage = errorText;
        }

        logError("createGallery", `HTTP ${response.status}: ${errorMessage}`);
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (!data || !data.id) {
        throw new Error("Resposta inválida do servidor ao criar galeria");
      }

      cache.clear();

      return data;
    } catch (error) {
      logError("createGallery", error);
      throw error instanceof Error
        ? error
        : new Error("Erro desconhecido ao criar galeria");
    }
  },

  async updateGallery(id: string, formData: FormData): Promise<Gallery> {
    try {
      if (!id || typeof id !== "string") {
        throw new Error("ID da galeria é obrigatório");
      }

      if (!formData) {
        throw new Error("Dados do formulário são obrigatórios");
      }

      const response = await fetch(
        `${API_BASE_URL}/gallery/${encodeURIComponent(id)}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (!response.ok) {
        let errorMessage = "Erro ao atualizar galeria";

        try {
          const errorData = (await response.json()) as ApiError;
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          const errorText = await response.text().catch(() => "");
          if (errorText) errorMessage = errorText;
        }

        logError("updateGallery", `HTTP ${response.status}: ${errorMessage}`);
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (!data || !data.id) {
        throw new Error("Resposta inválida do servidor ao atualizar galeria");
      }

      cache.clear();

      return data;
    } catch (error) {
      logError("updateGallery", error);
      throw error instanceof Error
        ? error
        : new Error("Erro desconhecido ao atualizar galeria");
    }
  },

  async deleteGallery(id: string): Promise<void> {
    try {
      if (!id || typeof id !== "string") {
        throw new Error("ID da galeria é obrigatório");
      }

      const response = await fetch(
        `${API_BASE_URL}/gallery/${encodeURIComponent(id)}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        let errorMessage = "Erro ao deletar galeria";

        try {
          const errorData = (await response.json()) as ApiError;
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          const errorText = await response.text().catch(() => "");
          if (errorText) errorMessage = errorText;
        }

        logError("deleteGallery", `HTTP ${response.status}: ${errorMessage}`);
        throw new Error(errorMessage);
      }

      cache.clear();
    } catch (error) {
      logError("deleteGallery", error);
      throw error instanceof Error
        ? error
        : new Error("Erro desconhecido ao deletar galeria");
    }
  },

  async toggleGalleryActive(id: string): Promise<Gallery> {
    try {
      if (!id || typeof id !== "string") {
        throw new Error("ID da galeria é obrigatório");
      }

      const response = await fetch(
        `${API_BASE_URL}/gallery/${encodeURIComponent(id)}/active`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        let errorMessage = "Erro ao alterar status da galeria";

        try {
          const errorData = (await response.json()) as ApiError;
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          const errorText = await response.text().catch(() => "");
          if (errorText) errorMessage = errorText;
        }

        logError(
          "toggleGalleryActive",
          `HTTP ${response.status}: ${errorMessage}`
        );
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (!data || !data.id) {
        throw new Error("Resposta inválida do servidor ao alterar status");
      }

      cache.clear();

      return data;
    } catch (error) {
      logError("toggleGalleryActive", error);
      throw error instanceof Error
        ? error
        : new Error("Erro desconhecido ao alterar status da galeria");
    }
  },
};

// ✅ CORREÇÃO: Funções auxiliares SEM body em GET
export async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;

    // ✅ CORREÇÃO: Separar method e body para evitar body em GET
    const { method = "GET", body, ...restOptions } = options;

    const fetchOptions: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      cache: "no-store",
      ...restOptions,
    };

    // ✅ CORREÇÃO: Só incluir body se não for GET
    if (method.toUpperCase() !== "GET" && body) {
      fetchOptions.body = body;
    }

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      let errorMessage = "Erro na requisição";

      try {
        const errorData = (await response.json()) as ApiError;
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        const errorText = await response.text().catch(() => "");
        if (errorText) errorMessage = errorText;
      }

      logError("apiFetch", `HTTP ${response.status}: ${errorMessage}`);
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    logError("apiFetch", error);
    throw error instanceof Error
      ? error
      : new Error("Erro desconhecido na requisição");
  }
}

export async function apiUpload(
  endpoint: string,
  method: string,
  formData: FormData
): Promise<unknown> {
  try {
    if (!formData) {
      throw new Error("Dados do formulário são obrigatórios");
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: method.toUpperCase(),
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = "Erro no upload";

      try {
        const errorData = (await response.json()) as ApiError;
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        const errorText = await response.text().catch(() => "");
        if (errorText) errorMessage = errorText;
      }

      logError("apiUpload", `HTTP ${response.status}: ${errorMessage}`);
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    logError("apiUpload", error);
    throw error instanceof Error
      ? error
      : new Error("Erro desconhecido no upload");
  }
}

// ✅ CORREÇÃO: Função para verificar se a API está disponível (SEM body em GET)
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    return response.ok;
  } catch (error) {
    logError("checkApiHealth", error);
    return false;
  }
}

// ✅ CORREÇÃO: Função para verificar conectividade com a API
export async function checkApiConnectivity(): Promise<{
  status: boolean;
  message: string;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (response.ok) {
      return {
        status: true,
        message: "API conectada e funcionando",
      };
    } else {
      return {
        status: false,
        message: `API respondeu com status ${response.status}`,
      };
    }
  } catch (error) {
    logError("checkApiConnectivity", error);
    return {
      status: false,
      message: "Não foi possível conectar com a API",
    };
  }
}

// Função para limpar cache manualmente
export function clearApiCache(): void {
  cache.clear();
}

export default api;
