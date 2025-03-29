import { CustomError, PaginationDto, CreateProductDto } from "../../core";
import { ProductModel } from "../../data";

export class ProductService {

    // Dependency Injection
    constructor(){}

    async createProduct( createProductDto: CreateProductDto ) {
        const productExist = await ProductModel.findOne({ name: createProductDto.name })
        if ( productExist ) throw CustomError.badRequest( 'Product already exists' );

        try {
            const product = new ProductModel({ ...createProductDto })
            await product.save()
            return product

        } catch (error) {
            throw CustomError.internalServer(`${ error }`)
        }
    }

    async getProducts( paginationDto: PaginationDto ) {

        const { page, limit } = paginationDto
        
        try {
            const [ total, products ] = await Promise.all([
                ProductModel.countDocuments(),
                ProductModel.find()
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .populate('user')
                    .populate('category')
                
            ])

            return {
                page,
                limit,
                total,
                next: `/api/products?page=${ page }&limit=${ limit }`,
                prev: (page - 1 > 0) ? `/api/products?page=${ ( page - 1 ) }&limit=${ limit }` : null,
                products,
            }

        } catch (error) {
            throw CustomError.internalServer('Internal Server Error')
        }
    } 
}