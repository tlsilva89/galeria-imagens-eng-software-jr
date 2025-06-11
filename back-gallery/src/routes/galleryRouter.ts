// back-gallery/src/routes/galleryRouter.ts
import { FastifyInstance } from "fastify";
import { GalleryController } from "../controllers/galleryController";

const galleryController = new GalleryController();

export async function galleryRoutes(fastify: FastifyInstance) {
  // Listar galerias com query parameters
  fastify.get(
    "/gallery",
    {
      schema: {
        querystring: {
          type: "object",
          properties: {
            page: { type: "string" },
            limit: { type: "string" },
            status: { type: "string", enum: ["all", "active", "inactive"] },
          },
        },
      },
    },
    galleryController.list
  );

  // Buscar galeria por ID
  fastify.get(
    "/gallery/:id",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
          required: ["id"],
        },
      },
    },
    galleryController.getById
  );

  // Criar nova galeria com multipart
  fastify.post(
    "/gallery",
    {
      schema: {
        consumes: ["multipart/form-data"],
        body: {
          type: "object",
          properties: {
            title: { type: "string" },
            image: { isFile: true },
          },
          required: ["title", "image"],
        },
      },
    },
    galleryController.create
  );

  // Atualizar galeria (PUT) com multipart
  fastify.put(
    "/gallery/:id",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
          required: ["id"],
        },
        consumes: ["multipart/form-data"],
        body: {
          type: "object",
          properties: {
            title: { type: "string" },
            image: { isFile: true },
          },
        },
      },
    },
    galleryController.update
  );

  // Deletar galeria (DELETE)
  fastify.delete(
    "/gallery/:id",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
          required: ["id"],
        },
        response: {
          204: {
            type: "null",
            description: "Galeria deletada com sucesso",
          },
          404: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    galleryController.delete
  );

  // Ativar/Desativar galeria (PATCH)
  fastify.patch(
    "/gallery/:id/active",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
          required: ["id"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              id: { type: "string" },
              title: { type: "string" },
              image: { type: "string" },
              active: { type: "boolean" },
              createdAt: { type: "string" },
              updatedAt: { type: "string" },
            },
          },
          404: {
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
    },
    galleryController.toggleActive
  );

  // Rota para verificar saúde da API
  fastify.get("/health", async (request, reply) => {
    return reply.send({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "gallery-api",
    });
  });

  // Rota para estatísticas (sem usar galleryController.prisma)
  fastify.get("/gallery/stats", async (request, reply) => {
    try {
      // Importar prisma diretamente
      const { prisma } = await import("../lib/prisma");

      const [total, active, inactive] = await Promise.all([
        prisma.gallery.count(),
        prisma.gallery.count({ where: { active: true } }),
        prisma.gallery.count({ where: { active: false } }),
      ]);

      return reply.send({
        total,
        active,
        inactive,
      });
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
      return reply.status(500).send({ error: "Erro ao buscar estatísticas" });
    }
  });
}
