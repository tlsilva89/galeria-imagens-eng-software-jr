"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Gallery } from "@/types/gallery";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Swal from "sweetalert2";

const editSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  image: z.instanceof(FileList).optional(),
});

type EditFormData = z.infer<typeof editSchema>;

interface EditFormProps {
  gallery: Gallery;
}

export default function EditForm({ gallery }: EditFormProps) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string>(
    `http://localhost:3001/uploads/${gallery.image}`
  );
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      title: gallery.title,
    },
  });

  const imageFile = watch("image");

  // Preview da nova imagem
  if (imageFile && imageFile[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setPreview(e.target.result as string);
      }
    };
    reader.readAsDataURL(imageFile[0]);
  }

  const onSubmit = async (data: EditFormData) => {
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", data.title);

      if (data.image && data.image[0]) {
        formData.append("image", data.image[0]);
      }

      await api.updateGallery(gallery.id, formData);

      await Swal.fire({
        title: "Sucesso!",
        text: "Galeria atualizada com sucesso.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });

      router.push("/");
    } catch (error) {
      console.error("Erro ao atualizar galeria:", error);
      Swal.fire({
        title: "Erro!",
        text: "Não foi possível atualizar a galeria.",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Preview da Imagem */}
        <div className="text-center">
          <Image
            src={preview}
            alt="Preview"
            width={256}
            height={192}
            className="mx-auto w-64 h-48 object-cover rounded-lg shadow-md"
            unoptimized
          />
        </div>

        {/* Campo Título */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Título
          </label>
          <input
            {...register("title")}
            type="text"
            id="title"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Digite o título da galeria"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        {/* Campo Imagem */}
        <div>
          <label
            htmlFor="image"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Nova Imagem (opcional)
          </label>
          <input
            {...register("image")}
            type="file"
            id="image"
            accept="image/*"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="mt-1 text-sm text-gray-500">
            Deixe em branco para manter a imagem atual
          </p>
        </div>

        {/* Botões */}
        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            {loading ? "Salvando..." : "Salvar Alterações"}
          </button>

          <Link
            href="/"
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors text-center"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
