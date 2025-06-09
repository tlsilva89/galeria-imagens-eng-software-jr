import { FastifyInstance } from "fastify";
import { galleryCreate, galleryUpdate, galleryUpload, listGallery } from "../controllers/galleryController";

export async function galleryRouter(app: FastifyInstance) {

    app.get("/gallery", listGallery);
    app.post("/gallery", galleryCreate);
    app.post("/gallery/:galleryId/upload", galleryUpload);

}