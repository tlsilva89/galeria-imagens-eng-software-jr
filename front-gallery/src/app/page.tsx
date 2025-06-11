import { api } from "@/lib/api";
import GalleryGrid from "./components/GalleryGrid";
import Header from "./components/Header";
import Navbar from "./components/Navbar";

export const revalidate = 60;

export default async function Home() {
  try {
    const initialData = await api.getGalleries(1, 12, "all");

    return (
      <main>
        <Navbar />
        <Header />
        <GalleryGrid initialData={initialData} />
      </main>
    );
  } catch (error) {
    console.error("Erro ao carregar dados iniciais:", error);

    // ✅ CORREÇÃO: Renderizar sem dados iniciais em caso de erro
    return (
      <main>
        <Navbar />
        <Header />
        <GalleryGrid />
      </main>
    );
  }
}
