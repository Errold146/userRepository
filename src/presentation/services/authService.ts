import { bcryptAdapter, envs, JwtAdapter } from "../../config";
import { CustomError, RegisterUserDto, UserEntity, LoginUserDto } from "../../core";
import { UserModel } from "../../data";
import { EmailService } from "./emailService";

export class AuthService {
    
    // Dependency Injection
    constructor(
        private readonly emailService: EmailService
    ){}

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

            // Enviar email de confirmación
            await this.sendEmailOfValidation( user.email )
            
            const { password, ...rest } = UserEntity.fromObject(user)

            // Generar jwt
            const token = await JwtAdapter.generateToken({ id: user.id })
            if (!token) throw CustomError.internalServer('Unexpected error');

            return { 
                user: {...rest}, 
                token 
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
        const token = await JwtAdapter.generateToken({ id: user.id })
        if (!token) throw CustomError.internalServer( 'Unexpected error' );

        return {
            rest,
            token
        }
    }

    private async sendEmailOfValidation( email: string ) {

        const token = await JwtAdapter.generateToken({ email })
        if ( !token ) throw CustomError.internalServer( 'Error generating token' );

        const link = `${ envs.WEBSERVICE_URL }/auth/validate-email/${ token }`;
        const html = `
            <h1>Validate your emial.</h1>
            <p>Click on the following link to validate your email.</p>
            <a href="${ link }">Validate email</a>
        `;

        const options = {
            to: email,
            subject: 'Welcome, please validate your email.',
            htmlBody: html, 
        }

        const isSent = await this.emailService.sendEmail( options ) 
        if ( !isSent ) throw CustomError.internalServer( 'Error sending email' );

        return true
    }

    public async validateEmail( token: string ) {
        const payload = await JwtAdapter.validateToken( token )
        if ( !payload ) throw CustomError.unAuthorized( 'Invalid Token' );

        const { email } = payload as { email: string }
        if ( !email ) throw CustomError.internalServer( 'Invalid email and/or token' );

        const user = await UserModel.findOne({ email })
        if ( !user ) throw CustomError.internalServer( 'Email and/or user not exist' );

        user.emailValidated = true
        await user.save()

        return true
    }
}