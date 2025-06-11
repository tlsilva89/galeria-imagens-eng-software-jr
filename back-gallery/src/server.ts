import fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import staticFiles from "@fastify/static";
import { galleryRoutes } from "./routes/galleryRouter";
import path from "path";

const server = fastify({
  logger: {
    level: "warn",
  },
  disableRequestLogging: true,
});

// Registrar CORS com todos os métodos necessários
server.register(cors, {
  origin: ["http://localhost:3000"], // URL do frontend
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // ✅ Incluir PATCH e DELETE
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});

// Registrar multipart com configurações otimizadas
server.register(multipart, {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1, // Máximo 1 arquivo por requisição
    fieldSize: 1024 * 1024, // 1MB para campos de texto
  },
  attachFieldsToBody: false, // Manter compatibilidade com request.file()
});

// Servir arquivos estáticos com configurações de segurança
server.register(staticFiles, {
  root: path.join(process.cwd(), "uploads"),
  prefix: "/uploads/",
  decorateReply: false, // Evitar conflitos
  schemaHide: true, // Ocultar da documentação automática
  setHeaders: (res, pathname) => {
    // Headers de segurança para imagens
    res.setHeader("Cache-Control", "public, max-age=31536000"); // Cache de 1 ano
    res.setHeader("X-Content-Type-Options", "nosniff");

    // Definir Content-Type baseado na extensão
    const ext = path.extname(pathname).toLowerCase();
    if ([".jpg", ".jpeg"].includes(ext)) {
      res.setHeader("Content-Type", "image/jpeg");
    } else if (ext === ".png") {
      res.setHeader("Content-Type", "image/png");
    } else if (ext === ".gif") {
      res.setHeader("Content-Type", "image/gif");
    } else if (ext === ".webp") {
      res.setHeader("Content-Type", "image/webp");
    }
  },
});

// Hook global para tratamento de erros
server.setErrorHandler(async (error, request, reply) => {
  console.error("Erro no servidor:", error);

  // Tratar erros específicos
  if (error.code === "FST_REQ_FILE_TOO_LARGE") {
    return reply.status(413).send({
      error: "Arquivo muito grande",
      message: "O arquivo deve ter no máximo 10MB",
    });
  }

  if (error.code === "FST_INVALID_MULTIPART_CONTENT_TYPE") {
    return reply.status(400).send({
      error: "Tipo de conteúdo inválido",
      message: "Envie um arquivo válido",
    });
  }

  // Erro genérico
  return reply.status(500).send({
    error: "Erro interno do servidor",
    message: "Ocorreu um erro inesperado",
  });
});

// Hook para log de requisições (opcional)
server.addHook("onRequest", async (request, _reply) => {
  console.log(`${request.method} ${request.url} - ${new Date().toISOString()}`);
});

// Hook para validação de Content-Type em uploads
server.addHook("preHandler", async (request, reply) => {
  if (request.method === "POST" || request.method === "PUT") {
    if (request.url.includes("/gallery")) {
      const contentType = request.headers["content-type"];
      if (contentType && !contentType.includes("multipart/form-data")) {
        // Permitir JSON para algumas operações
        if (!contentType.includes("application/json")) {
          return reply.status(400).send({
            error: "Content-Type inválido",
            message: "Use multipart/form-data para upload de arquivos",
          });
        }
      }
    }
  }
});

// Registrar rotas
server.register(galleryRoutes);

// Rota de health check
server.get("/health", async (request, reply) => {
  return reply.send({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "gallery-api",
    version: "1.0.0",
    uptime: process.uptime(),
  });
});

// Rota para verificar uploads
server.get("/uploads-check", async (request, reply) => {
  const uploadsPath = path.join(process.cwd(), "uploads");
  const fs = await import("fs/promises");

  try {
    await fs.access(uploadsPath);
    return reply.send({
      status: "ok",
      uploadsPath,
      message: "Pasta uploads acessível",
    });
  } catch (error) {
    console.error("Erro ao verificar pasta uploads:", error);
    return reply.status(500).send({
      status: "error",
      uploadsPath,
      message: "Pasta uploads não encontrada",
    });
  }
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`Recebido sinal ${signal}, fechando servidor...`);

  try {
    await server.close();
    console.log("Servidor fechado com sucesso");
    process.exit(0);
  } catch (error) {
    console.error("Erro ao fechar servidor:", error);
    process.exit(1);
  }
};

// Registrar handlers para shutdown
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Função de inicialização melhorada
const start = async () => {
  try {
    // Verificar se a pasta uploads existe
    const uploadsPath = path.join(process.cwd(), "uploads");
    const fs = await import("fs/promises");

    try {
      await fs.access(uploadsPath);
      console.log("✅ Pasta uploads encontrada");
    } catch {
      await fs.mkdir(uploadsPath, { recursive: true });
      console.log("✅ Pasta uploads criada");
    }

    // Iniciar servidor
    await server.listen({
      port: 3001,
      host: "0.0.0.0", // ✅ CRÍTICO: 0.0.0.0 para Docker/containers
    });

    console.log("🚀 Servidor rodando na porta 3001");
    console.log("📁 Arquivos estáticos servidos em /uploads/");
    console.log("🏥 Health check disponível em /health");
  } catch (err) {
    console.error("❌ Erro ao iniciar servidor:", err);
    server.log.error(err);
    process.exit(1);
  }
};

// Iniciar servidor
start();
