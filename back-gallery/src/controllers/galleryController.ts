import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { unlink } from "fs/promises";
import path from "path";
import { createWriteStream } from "fs";
import { pipeline } from "stream/promises";

const createGallerySchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
});

const updateGallerySchema = z.object({
  title: z.string().min(1, "Título é obrigatório").optional(),
});

const paramsSchema = z.object({
  id: z.string(),
});

const querySchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("12"),
  status: z.enum(["all", "active", "inactive"]).optional().default("all"),
});

export class GalleryController {
  async list(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { page, limit, status } = querySchema.parse(request.query);

      const pageNumber = parseInt(page);
      const limitNumber = parseInt(limit);
      const skip = (pageNumber - 1) * limitNumber;

      const where =
        status === "all"
          ? {}
          : status === "active"
          ? { active: true }
          : { active: false };

      const [galleries, total] = await Promise.all([
        prisma.gallery.findMany({
          where,
          skip,
          take: limitNumber,
          orderBy: { createdAt: "desc" },
        }),
        prisma.gallery.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limitNumber);

      return reply.send({
        galleries,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          total,
          totalPages,
          hasNext: pageNumber < totalPages,
          hasPrev: pageNumber > 1,
        },
      });
    } catch (error) {
      console.error("Erro ao listar galerias:", error);
      return reply.status(500).send({ error: "Erro interno do servidor" });
    }
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = paramsSchema.parse(request.params);

      const gallery = await prisma.gallery.findUnique({
        where: { id },
      });

      if (!gallery) {
        return reply.status(404).send({ error: "Galeria não encontrada" });
      }

      return reply.send(gallery);
    } catch (error) {
      console.error("Erro ao buscar galeria:", error);
      return reply.status(500).send({ error: "Erro interno do servidor" });
    }
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = await request.file();

      if (!data) {
        return reply.status(400).send({ error: "Imagem é obrigatória" });
      }

      // Corrigindo o acesso aos campos do multipart
      let title = "";
      if (data.fields && data.fields.title) {
        const titleField = data.fields.title;
        if (Array.isArray(titleField)) {
          // Se é array, pega o primeiro elemento e acessa o valor
          const firstField = titleField[0];
          title =
            typeof firstField === "object" && "value" in firstField
              ? (firstField as any).value
              : String(firstField);
        } else {
          // Se não é array, verifica se tem propriedade value
          title =
            typeof titleField === "object" && "value" in titleField
              ? (titleField as any).value
              : String(titleField);
        }
      }

      const { title: validatedTitle } = createGallerySchema.parse({ title });

      const filename = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}.${data.filename?.split(".").pop()}`;
      const filepath = path.join(process.cwd(), "uploads", filename);

      await pipeline(data.file, createWriteStream(filepath));

      const gallery = await prisma.gallery.create({
        data: {
          title: validatedTitle,
          image: filename,
          active: true,
        },
      });

      return reply.status(201).send(gallery);
    } catch (error) {
      console.error("Erro ao criar galeria:", error);
      return reply.status(500).send({ error: "Erro interno do servidor" });
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = paramsSchema.parse(request.params);

      const existingGallery = await prisma.gallery.findUnique({
        where: { id },
      });

      if (!existingGallery) {
        return reply.status(404).send({ error: "Galeria não encontrada" });
      }

      const data = await request.file();
      let updateData: any = {};

      if (data) {
        // Corrigindo o acesso aos campos do multipart
        let title = "";
        if (data.fields && data.fields.title) {
          const titleField = data.fields.title;
          if (Array.isArray(titleField)) {
            // Se é array, pega o primeiro elemento e acessa o valor
            const firstField = titleField[0];
            title =
              typeof firstField === "object" && "value" in firstField
                ? (firstField as any).value
                : String(firstField);
          } else {
            // Se não é array, verifica se tem propriedade value
            title =
              typeof titleField === "object" && "value" in titleField
                ? (titleField as any).value
                : String(titleField);
          }
        }

        if (title) {
          const { title: validatedTitle } = updateGallerySchema.parse({
            title,
          });
          updateData.title = validatedTitle;
        }

        // Processar nova imagem
        const filename = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(7)}.${data.filename?.split(".").pop()}`;
        const filepath = path.join(process.cwd(), "uploads", filename);

        await pipeline(data.file, createWriteStream(filepath));
        updateData.image = filename;

        // Remover imagem antiga
        try {
          await unlink(
            path.join(process.cwd(), "uploads", existingGallery.image)
          );
        } catch (error) {
          console.log("Erro ao remover imagem antiga:", error);
        }
      } else {
        // Se não há arquivo, é apenas atualização de título
        const { title } = updateGallerySchema.parse(request.body);
        if (title) updateData.title = title;
      }

      const gallery = await prisma.gallery.update({
        where: { id },
        data: updateData,
      });

      return reply.send(gallery);
    } catch (error) {
      console.error("Erro ao atualizar galeria:", error);
      return reply.status(500).send({ error: "Erro interno do servidor" });
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = paramsSchema.parse(request.params);

      const gallery = await prisma.gallery.findUnique({
        where: { id },
      });

      if (!gallery) {
        return reply.status(404).send({ error: "Galeria não encontrada" });
      }

      // Remover arquivo de imagem
      try {
        await unlink(path.join(process.cwd(), "uploads", gallery.image));
      } catch (error) {
        console.log("Erro ao remover arquivo de imagem:", error);
      }

      await prisma.gallery.delete({
        where: { id },
      });

      return reply.status(204).send();
    } catch (error) {
      console.error("Erro ao deletar galeria:", error);
      return reply.status(500).send({ error: "Erro interno do servidor" });
    }
  }

  async toggleActive(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = paramsSchema.parse(request.params);

      const gallery = await prisma.gallery.findUnique({
        where: { id },
      });

      if (!gallery) {
        return reply.status(404).send({ error: "Galeria não encontrada" });
      }

      const updatedGallery = await prisma.gallery.update({
        where: { id },
        data: { active: !gallery.active },
      });

      return reply.send(updatedGallery);
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      return reply.status(500).send({ error: "Erro interno do servidor" });
    }
  }
}
