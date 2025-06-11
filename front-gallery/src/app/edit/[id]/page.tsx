import { api } from "@/lib/api";
import EditForm from "./EditForm";
import { notFound } from "next/navigation";

interface EditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditPage({ params }: EditPageProps) {
  const { id } = await params;

  try {
    const gallery = await api.getGalleryById(id);

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">
              Editar Galeria
            </h1>
            <EditForm gallery={gallery} />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Erro ao buscar galeria:", error);
    notFound();
  }
}
