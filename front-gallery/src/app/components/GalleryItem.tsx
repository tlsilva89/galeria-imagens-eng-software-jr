"use client";

import { Gallery } from "@/types/gallery";
import { api } from "@/lib/api";
import Link from "next/link";
import Image from "next/image";
import Swal from "sweetalert2";

interface GalleryItemProps {
  gallery: Gallery;
  onUpdate: () => void;
}

export default function GalleryItem({ gallery, onUpdate }: GalleryItemProps) {
  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Tem certeza?",
      text: "Esta ação não pode ser desfeita!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sim, deletar!",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await api.deleteGallery(gallery.id);

        Swal.fire({
          title: "Deletado!",
          text: "A galeria foi removida com sucesso.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });

        onUpdate();
      } catch (error) {
        console.error("Erro ao deletar galeria:", error);
        Swal.fire({
          title: "Erro!",
          text: "Não foi possível deletar a galeria.",
          icon: "error",
        });
      }
    }
  };

  const handleToggleActive = async () => {
    const action = gallery.active ? "desativar" : "ativar";

    const result = await Swal.fire({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} galeria?`,
      text: `Deseja ${action} esta galeria?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: gallery.active ? "#d33" : "#28a745",
      cancelButtonColor: "#6c757d",
      confirmButtonText: `Sim, ${action}!`,
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await api.toggleGalleryActive(gallery.id);

        Swal.fire({
          title: "Sucesso!",
          text: `Galeria ${
            gallery.active ? "desativada" : "ativada"
          } com sucesso.`,
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });

        onUpdate();
      } catch (error) {
        console.error("Erro ao alterar status da galeria:", error);
        Swal.fire({
          title: "Erro!",
          text: `Não foi possível ${action} a galeria.`,
          icon: "error",
        });
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
      <div className="relative">
        <Image
          src={`http://localhost:3001/uploads/${gallery.image}`}
          alt={gallery.title}
          width={300}
          height={192}
          className="w-full h-48 object-cover"
          unoptimized
        />
        <div
          className={`absolute top-2 right-2 w-3 h-3 rounded-full ${
            gallery.active ? "bg-green-500" : "bg-red-500"
          }`}
        />
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 truncate">
          {gallery.title}
        </h3>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/edit/${gallery.id}`}
            className="flex-1 min-w-0 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors text-center"
          >
            🖉 Editar
          </Link>

          <button
            onClick={handleDelete}
            className="flex-1 min-w-0 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
          >
            🗑️ Deletar
          </button>

          <button
            onClick={handleToggleActive}
            className={`flex-1 min-w-0 px-3 py-2 rounded text-sm font-medium transition-colors ${
              gallery.active
                ? "bg-red-100 hover:bg-red-200 text-red-700"
                : "bg-green-100 hover:bg-green-200 text-green-700"
            }`}
          >
            {gallery.active ? "🔴 Desativar" : "🟢 Ativar"}
          </button>
        </div>
      </div>
    </div>
  );
}
