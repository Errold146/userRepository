import { Response, Request } from "express"
import type { UploadedFile } from "express-fileupload"
import { CustomError } from "../../core"
import { UploadService } from "../services"

export class UplaodController {

    // Dependency Injection
    constructor(
        private readonly uploadService: UploadService
    ){}

    private handleError = ( error: unknown, res: Response ) => {
        if ( error instanceof CustomError ) {
            return res.status( error.statusCode ).json({ error: error.message })
        }
        console.log(`${ error }`)
        return res.status(500).json({ error: 'Error Internal Server' })
    }

    uploadFile = (req: Request, res: Response) => {

        try {
            const type = req.params.type  
            const file = req.body.files.at(0) as UploadedFile

            this.uploadService.uploadSingle(file, `uploads/${ type }`) 
                .then(up => res.json(up))
                .catch(err => this.handleError(err, res));
                
        } catch (error) {
            this.handleError(error, res);
        }
    };
    
    uploadMultipleFiles = async (req: Request, res: Response) => {

        try {
            const type = req.params.type;
            const files = req.body.files as UploadedFile[]
            const validExtensions = ['png', 'jpg', 'jpeg', 'gif'];
            const invalidFiles = files.filter(file => !validExtensions
                .includes(file.name
                .split('.')
                .pop()?.toLowerCase() 
                || ''
            ))
            if (invalidFiles.length > 0) {
                return res.status(400).json({ error: 'Some files have invalid extensions', invalidFiles });
            }

            const results = await this.uploadService.uploadMultiple(files, `uploads/${type}`, validExtensions);
            res.json(results);
            
        } catch (error) {
            this.handleError(error, res);
        }
    };
}