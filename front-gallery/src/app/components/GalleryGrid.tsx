/* eslint-disable @next/next/no-img-element */

import { apiFetch } from "@/lib/api";
import { convertUrl } from "@/lib/utils";
import Link from "next/link";

type GalleryItem = {
  id: number;
  title: string;
  url: string;
};

export default async function GalleryGrid() {
  const data = await apiFetch("/gallery?limit=8&offset=0", {
    method: "GET",
    next: { revalidate: 60 }, // revalidação para SSG
  });

  const images: GalleryItem[] = data.rows;

  return (
    <div className="grid grid-cols-3 gap-4 p-16 ">
      {images.map((img) => (
        <div key={img.id} className="relative">
          <img
            src={convertUrl(img.url)}
            alt={img.title}
            className="w-full h-[450px] rounded shadow bg-cover"
          />
          <Link href="create"  className="bg-gray-600 p-4 rounded-lg">
            Add
          </Link>
          </div>
      ))}
    </div>
  );
}
