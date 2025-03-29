import { Types } from "mongoose"
import { seedData } from "./data"
import { envs } from "../../config"
import { UserModel, MongoDatabase, CategoryModel, ProductModel } from "../mongo"

( async () => {
    await MongoDatabase.connect({
        dbName: envs.MONGO_DB_NAME,
        mongoUrl: envs.MONGO_URL
    })

    await main()

    await MongoDatabase.disconnect()
})()

const includesCategoriesProducts = ( x: number ) => {
    return Math.floor( Math.random() * x )
}

async function main() {

    // Borrar datos anteriores
    await Promise.all([
        UserModel.deleteMany(),
        CategoryModel.deleteMany(),
        ProductModel.deleteMany(),
    ])
    
    // Crear Usuarios
    type UserWithId = {
        emailValidated: boolean;
        name: string;
        email: string;
        password: string;
        _id: Types.ObjectId;
    };
    const users: UserWithId[] = await UserModel.insertMany(seedData.users);

    // Crear Categorias
    const categories = await CategoryModel.insertMany(
        seedData.categories.map(cat => ({
            ...cat,
            user: users[0]._id,
        }))
    );

    // Crear Productos
    await ProductModel.insertMany(
        seedData.products.map(pro => ({
            ...pro,
            user: users[includesCategoriesProducts(seedData.users.length - 1)]._id,
            category: categories[includesCategoriesProducts(seedData.categories.length - 1)]._id,
        }))
    );

    console.log('Executed Seed')
}