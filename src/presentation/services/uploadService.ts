import path from "path";
import fs from 'fs';
import { UploadedFile } from "express-fileupload";
import { UuId } from "../../config";
import { CustomError } from "../../core";

export class UploadService {

    // Dependency Injection
    constructor(
        private readonly uuid = UuId.v4
    ){}

    // Check if the folder where the image will be saved exists
    private checkFolder( folderPath: string ) {
        if ( !fs.existsSync(folderPath) ) {
            fs.mkdirSync( folderPath )
        }
    }

    public async uploadSingle(
        file: UploadedFile,
        folder: string = 'uploads',
        validExtensions: string[] = ['png', 'jpg', 'jpeg', 'gif']
    ) {
        try {

            // Verificar si el archivo existe
            if (!file) {
                throw CustomError.badRequest('No file was provided.')
            }

            // Extraer la extención del archivo
            const fileExtension = file.mimetype.split('/').at(1) ?? ''

            // Verifica que la extensión sea válida
            if ( !validExtensions.includes(fileExtension) ) {
                throw CustomError.badRequest(`Invalid extension: ${fileExtension}, valid ones ${ validExtensions }`)
            }

            // Incluir la ruta donde se guardara el archivo
            const destination = path.resolve(__dirname, '../../../', folder);
            this.checkFolder(destination);

            // Crear el nombre del archivo
            const fileName = `${ this.uuid() }.${ fileExtension }`

            // Mover el archivo al directorio
            file.mv(`${ destination }/${ fileName }`);
            
            return { fileName }
            
        } catch (error) {
            
            // Lanza el error para manejarlo más arriba si es necesario
            console.log({ error });
            throw CustomError.internalServer(`${ error }`);
        }
    }

    // Upload multiple files
    public async uploadMultiple(
        files: UploadedFile[],
        folder: string = 'uploads',
        validExtensions: string[] = ['png', 'jpg', 'jpeg', 'gif']
    ) {
        const results = await Promise.allSettled(
            files.map(file => this.uploadSingle(file, folder, validExtensions))
        );

        const successfulUploads = results
            .filter(result => result.status === 'fulfilled')
            .map(result => (result as PromiseFulfilledResult<{ fileName: string }>).value.fileName);

        const failedUploads = results
            .filter(result => result.status === 'rejected')
            .map(result => (result as PromiseRejectedResult).reason);

        return { successfulUploads };
    }
}