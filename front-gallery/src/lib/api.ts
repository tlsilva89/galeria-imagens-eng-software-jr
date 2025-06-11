import { Gallery, GalleryResponse } from "@/types/gallery";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface ApiError {
  message?: string;
}

export const api = {
  async getGalleries(
    page = 1,
    limit = 12,
    status = "all"
  ): Promise<GalleryResponse> {
    const response = await fetch(
      `${API_BASE_URL}/gallery?page=${page}&limit=${limit}&status=${status}`,
      {
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) {
      throw new Error("Erro ao buscar galerias");
    }

    return response.json();
  },

  async getGalleryById(id: string): Promise<Gallery> {
    const response = await fetch(`${API_BASE_URL}/gallery/${id}`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error("Galeria não encontrada");
    }

    return response.json();
  },

  async createGallery(formData: FormData): Promise<Gallery> {
    const response = await fetch(`${API_BASE_URL}/gallery`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Erro ao criar galeria");
    }

    return response.json();
  },

  async updateGallery(id: string, formData: FormData): Promise<Gallery> {
    const response = await fetch(`${API_BASE_URL}/gallery/${id}`, {
      method: "PUT",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Erro ao atualizar galeria");
    }

    return response.json();
  },

  async deleteGallery(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/gallery/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Erro ao deletar galeria");
    }
  },

  async toggleGalleryActive(id: string): Promise<Gallery> {
    const response = await fetch(`${API_BASE_URL}/gallery/${id}/active`, {
      method: "PATCH",
    });

    if (!response.ok) {
      throw new Error("Erro ao alterar status da galeria");
    }

    return response.json();
  },
};

// Manter compatibilidade com código existente
export async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const error = (await res.json().catch(() => ({}))) as ApiError;
    throw new Error(error.message || "Erro na requisição");
  }

  return res.json();
}

export async function apiUpload(
  endpoint: string,
  method: string,
  formData: FormData
): Promise<unknown> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    body: formData,
  });

  if (!res.ok) {
    const error = (await res.json().catch(() => ({}))) as ApiError;
    throw new Error(error.message || "Erro no upload");
  }

  return res.json();
}
