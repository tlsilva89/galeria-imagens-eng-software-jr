import { FastifyInstance } from "fastify";
import { GalleryController } from "../controllers/galleryController";

const galleryController = new GalleryController();

export async function galleryRoutes(fastify: FastifyInstance) {
  // Listar galerias com paginação e filtros
  fastify.get("/gallery", galleryController.list);

  // Buscar galeria por ID
  fastify.get("/gallery/:id", galleryController.getById);

  // Criar nova galeria
  fastify.post("/gallery", galleryController.create);

  // Atualizar galeria
  fastify.put("/gallery/:id", galleryController.update);

  // Deletar galeria
  fastify.delete("/gallery/:id", galleryController.delete);

  // Ativar/Desativar galeria
  fastify.patch("/gallery/:id/active", galleryController.toggleActive);
}
