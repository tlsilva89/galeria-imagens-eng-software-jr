// front-gallery/src/app/create/GalleryForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { gallerySchema, GalleryFormData } from "./schema";
import { api } from "@/lib/api";
import Image from "next/image";

interface ApiError {
  message?: string;
}

export default function GalleryForm() {
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<GalleryFormData>({
    resolver: zodResolver(gallerySchema),
  });

  const onSubmit = async (data: GalleryFormData) => {
    try {
      const formData = new FormData();
      formData.append("title", data.title);

      const file = data.image[0] as File;
      formData.append("image", file);

      await api.createGallery(formData);

      setMessage("Galeria criada com sucesso!");
      setPreview(null);
      reset();

      // Redireciona para home após 2 segundos
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err: unknown) {
      const error = err as ApiError;
      setMessage(error?.message || "Erro ao criar galeria");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 max-w-md mx-auto"
    >
      <h2 className="text-xl font-bold text-center">Upload image</h2>

      <div>
        <label className="block font-medium">Título</label>
        <input
          type="text"
          {...register("title")}
          className="w-full border p-2 rounded"
        />
        {errors.title && <p className="text-red-500">{errors.title.message}</p>}
      </div>

      <div>
        <label className="block font-medium">Imagem</label>
        <input
          type="file"
          accept="image/*"
          {...register("image")}
          onChange={handleImageChange}
          className="w-full bg-gray-700 text-white p-4 rounded-md hover:bg-gray-500"
        />
        {errors.image && (
          <p className="text-red-500">{errors.image.message as string}</p>
        )}
      </div>

      {preview && (
        <div className="border p-2 rounded text-center">
          <p className="font-medium mb-2">Image preview</p>
          <Image
            src={preview}
            alt="Preview"
            width={256}
            height={256}
            className="max-h-64 mx-auto rounded object-cover"
            unoptimized
          />
        </div>
      )}

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded w-full"
      >
        Upload
      </button>

      {message && (
        <p
          className={`mt-4 text-center ${
            message.includes("sucesso") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
}
