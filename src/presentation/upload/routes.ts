import { Router } from "express";
import { UplaodController } from "./controller";
import { UploadService } from "../services";
import { FileUploadMiddleware, TypeMiddleware } from "../middlewares";

export class UploadRoutes {

    static get routes(): Router {
        
        const router = Router()
        const controller = new UplaodController(
            new UploadService()
        )

        router.use( FileUploadMiddleware.cotainsFiles )
        router.use( TypeMiddleware.validTypes([ 'users', 'products', 'categories' ]))

        router.post( '/single/:type', controller.uploadFile )
        router.post( '/multiple/:type', controller.uploadMultipleFiles )

        return router
    }
}