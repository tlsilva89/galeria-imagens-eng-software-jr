
import { z } from "zod";

export const gallerySchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  image: z
    .any()
    .refine((files) => files?.length > 0, "Imagem é obrigatória"),

});

export type GalleryFormData = z.infer<typeof gallerySchema>;
