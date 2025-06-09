/* eslint-disable @typescript-eslint/no-explicit-any */
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://sua-api.com";

type FetchOptions = RequestInit & {
    headers?: Record<string, string>;
};

export async function apiFetch<T = any>(
    endpoint: string,
    options: FetchOptions = {}
): Promise<T> {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
        cache: "no-store", // ou "force-cache" / "no-cache" dependendo do caso
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Erro na requisição");
    }

    return res.json();
}



export async function apiUpload<T = any>(
  endpoint: string,
  method: string = "POST",
  formData: FormData
): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Erro no upload");
  }

  return res.json();
}
