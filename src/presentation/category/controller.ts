import { Response, Request } from "express"
import { CreateCategoryDto, CustomError, PaginationDto } from "../../core"
import { CategoryService } from "../services"

export class CategoryController {

    // Dependency Injection
    constructor(
        private readonly categoryService: CategoryService
    ){}

    private handleError = ( error: unknown, res: Response ) => {
        if ( error instanceof CustomError ) {
            return res.status( error.statusCode ).json({ error: error.message })
        }
        console.log(`${ error }`)
        return res.status(500).json({ error: 'Error Internal Server' })
    }

    createCategory = ( req: Request, res: Response ) => {

        const [ error, createCategoryDto ] = CreateCategoryDto.create( req.body )
        if ( error ) return res.status(400).json({ error });
        this.categoryService.createCategory( createCategoryDto!, req.body.user )
            .then( category => res.status(201).json( category ))
            .catch( err => this.handleError( err, res ))
    }
    
    getCategory = async ( req: Request, res: Response ) => {
        
        const { page = 1, limit = 10 } = req.query 
        const [ error, paginationDto ] = PaginationDto.create( +page, +limit )
        if ( error ) return res.status(400).json({ error });
        
        this.categoryService.getCategories( paginationDto! )
            .then( categories => res.json( categories ) )
            .catch( err => this.handleError( err, res ))
    }
}