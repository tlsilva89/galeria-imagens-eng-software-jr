import { api } from "@/lib/api";
import GalleryGrid from "./components/GalleryGrid";
import Header from "./components/Header";
import Navbar from "./components/Navbar";

export const revalidate = 60; // ISR - revalidar a cada 60 segundos

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
    console.error("Erro ao carregar dados:", error);
    return (
      <main>
        <Navbar />
        <Header />
        <GalleryGrid />
      </main>
    );
  }
}
