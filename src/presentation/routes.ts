import { Router } from 'express';
import { AuthRoutes } from './auth/routes';
import { CategoryRoutes } from './category/routes';
import { ProductsRoutes } from './products/routes';
import { UploadRoutes } from './upload/routes';
import { ImageRoutes } from './images/routes';

export class AppRoutes {

    static get routes(): Router {

        const router = Router();
        
        // Definir las rutas
        router.use('/api/auth', AuthRoutes.routes );
        router.use('/api/categories', CategoryRoutes.routes );
        router.use('/api/products', ProductsRoutes.routes );
        router.use('/api/upload', UploadRoutes.routes );
        router.use('/api/images', ImageRoutes.routes );

        return router;
    }
}

