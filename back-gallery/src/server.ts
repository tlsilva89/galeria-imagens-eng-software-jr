import fastify from "fastify";
import cors from "@fastify/cors";
import multipart from '@fastify/multipart';
import dotenv from "dotenv";
import { resolve } from 'path';
import { galleryRouter } from "./routes/galleryRouter";


dotenv.config();

export const app = fastify({});


app.register(multipart);

app.register(require('@fastify/static'), {
  root: resolve(__dirname, '../uploads'),
  prefix: '/uploads',
});

app.register(cors, {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:3000',
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    }
  },
  credentials: true, // Permite cookies ou cabeçalhos de autenticação
});

app.register(galleryRouter);



app
  .listen({
    port: 3333,
    host: "0.0.0.0",
  })
  .then(() => {
    console.log("HTTP server running on http://localhost:3333");
  });