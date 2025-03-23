import { bcryptAdapter, JwtAdapter } from "../../config";
import { CustomError, RegisterUserDto, UserEntity, LoginUserDto } from "../../core";
import { UserModel } from "../../data";

export class AuthService {
    
    //! Dependency Injection
    constructor(){}

    public async registerUser( registerUserDto: RegisterUserDto ) {
        
        // Verificar usuario
        const existUser = await UserModel.findOne({ email: registerUserDto.email })
        if (existUser) throw CustomError.badRequest( 'The user already exists' )
        
        try {
            const user = new UserModel(registerUserDto)

            // Encriptar la contraseña
            user.password = bcryptAdapter.hash( registerUserDto.password )

            // Guardar en db el usuario
            await user.save()
            
            const { password, ...rest } = UserEntity.fromObject(user)

            return { 
                user: {...rest}, 
                token: 'abc123' 
            }

        } catch (error) {
            throw CustomError.internalServer(`${ error }`)
        }
    }

    public async loginUser( loginUserDto: LoginUserDto ) {
        
        // Verificar usuario
        const user = await UserModel.findOne({ email: loginUserDto.email })
        if ( !user ) throw CustomError.badRequest('The user not exists')

        // Verificar el password
        const isMatching = bcryptAdapter.compare( loginUserDto.password, user.password )
        if ( !isMatching ) throw CustomError.badRequest('Invalid password')

        const { password, ...rest } = UserEntity.fromObject( user )

        // Generar jwt
        const token = await JwtAdapter.generateToken({ id: user.id, email: user.email })
        if (!token) throw CustomError.internalServer( 'Unexpected error' );

        return {
            rest,
            token
        }
    }
}