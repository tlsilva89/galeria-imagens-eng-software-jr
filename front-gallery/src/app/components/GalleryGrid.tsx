"use client";

import { useState } from "react";
import { GalleryResponse } from "@/types/gallery";
import { api } from "@/lib/api";
import GalleryItem from "./GalleryItem";

interface GalleryGridProps {
  initialData?: GalleryResponse;
}

export default function GalleryGrid({ initialData }: GalleryGridProps) {
  const [data, setData] = useState<GalleryResponse>(
    initialData || {
      galleries: [],
      pagination: {
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    }
  );
  const [loading, setLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<
    "all" | "active" | "inactive"
  >("all");

  const fetchGalleries = async (page = 1, status = currentStatus) => {
    setLoading(true);
    try {
      const newData = await api.getGalleries(page, 12, status);
      setData(newData);
    } catch (error) {
      console.error("Erro ao buscar galerias:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilter = (status: "all" | "active" | "inactive") => {
    setCurrentStatus(status);
    fetchGalleries(1, status);
  };

  const handlePageChange = (page: number) => {
    fetchGalleries(page, currentStatus);
  };

  const handleUpdate = () => {
    fetchGalleries(data.pagination.page, currentStatus);
  };

  // Carregar dados iniciais se não foram fornecidos
  if (!initialData && data.galleries.length === 0 && !loading) {
    fetchGalleries();
  }

  return (
    <div className="space-y-6 p-6">
      {/* Filtros */}
      <div className="flex flex-wrap gap-2 justify-center">
        <button
          onClick={() => handleStatusFilter("all")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            currentStatus === "all"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          🔘 Todos
        </button>
        <button
          onClick={() => handleStatusFilter("active")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            currentStatus === "active"
              ? "bg-green-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          ✅ Ativos
        </button>
        <button
          onClick={() => handleStatusFilter("inactive")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            currentStatus === "inactive"
              ? "bg-red-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          ❌ Inativos
        </button>
      </div>

      {/* Grid de Galerias */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {data.galleries.map((gallery) => (
              <GalleryItem
                key={gallery.id}
                gallery={gallery}
                onUpdate={handleUpdate}
              />
            ))}
          </div>

          {data.galleries.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                Nenhuma galeria encontrada.
              </p>
            </div>
          )}
        </>
      )}

      {/* Paginação */}
      {data.pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4">
          <button
            onClick={() => handlePageChange(data.pagination.page - 1)}
            disabled={!data.pagination.hasPrev || loading}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
          >
            ← Anterior
          </button>

          <span className="text-gray-600">
            Página {data.pagination.page} de {data.pagination.totalPages}
          </span>

          <button
            onClick={() => handlePageChange(data.pagination.page + 1)}
            disabled={!data.pagination.hasNext || loading}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
          >
            Próxima →
          </button>
        </div>
      )}
    </div>
  );
}
