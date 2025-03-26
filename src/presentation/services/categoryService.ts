import { CreateCategoryDto, CustomError, UserEntity, PaginationDto } from "../../core";
import { CategoryModel } from "../../data";

export class CategoryService {

    // Dependency Injection
    constructor(){}

    async createCategory( createCategoryDto: CreateCategoryDto, user: UserEntity ) {
        const categoryExist = await CategoryModel.findOne({ name: createCategoryDto.name })
        if ( categoryExist ) throw CustomError.badRequest( 'Category already exists' );

        try {
            const category = new CategoryModel({
                ...createCategoryDto,
                user: user.id,
            })
            await category.save()
            return {
                id: category.id,
                name: category.name,
                available: category.available,
            }

        } catch (error) {
            throw CustomError.internalServer(`${ error }`)
        }
    }

    async getCategories( paginationDto: PaginationDto ) {

        const { page, limit } = paginationDto
        
        try {
            const [total, categories] = await Promise.all([
                CategoryModel.countDocuments(),
                CategoryModel.find().skip((page - 1) * limit).limit(limit),
            ])

            return {
                page,
                limit,
                total,
                next: `/api/categories?page=${ page }&limit=${ limit }`,
                prev: (page - 1 > 0) ? `/api/categories?page=${ ( page - 1 ) }&limit=${ limit }` : null,
                categories: categories.map(category => ({
                    id: category.id,
                    name: category.name,
                    available: category.available,
                }))
            }

        } catch (error) {
            throw CustomError.internalServer('Internal Server Error')
        }
    } 
}