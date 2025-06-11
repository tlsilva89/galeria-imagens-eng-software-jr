import fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import { galleryRoutes } from "./routes/galleryRouter";

const server = fastify({ logger: true });

// Registrar plugins
server.register(cors, {
  origin: ["http://localhost:3000"],
});

server.register(multipart, {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// Servir arquivos estáticos
server.register(require("@fastify/static"), {
  root: require("path").join(__dirname, "..", "uploads"),
  prefix: "/uploads/",
});

// Registrar rotas
server.register(galleryRoutes);

const start = async () => {
  try {
    await server.listen({ port: 3001, host: "0.0.0.0" });
    console.log("Servidor rodando na porta 3001");
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
