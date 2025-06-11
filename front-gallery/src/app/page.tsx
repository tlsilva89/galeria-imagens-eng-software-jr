// front-gallery/src/app/page.tsx
import { api } from "@/lib/api";
import GalleryGrid from "./components/GalleryGrid";

export const revalidate = 60; // ISR - revalidar a cada 60 segundos

export default async function Home() {
  const initialData = await api.getGalleries(1, 12, "all");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <GalleryGrid initialData={initialData} />
      </div>
    </div>
  );
}
