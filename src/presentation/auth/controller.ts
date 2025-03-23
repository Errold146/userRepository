import { Request, Response } from "express";
import { CustomError, LoginUserDto, RegisterUserDto } from "../../core";
import type { AuthService } from "../services/authService";

export class AuthController {

    //! Dependency Injection
    constructor(
        public readonly authService: AuthService
    ){}

    private handleError = ( error: unknown, res: Response ) => {
        if ( error instanceof CustomError ) {
            return res.status( error.statusCode ).json({ error: error.message })
        }

        console.log(`${ error }`)
        return res.status(500).json({ error: 'Error Internal Server' })
    }

    registerUser = ( req: Request, res: Response ) => {
    
        const [ error, registerDto ] = RegisterUserDto.create( req.body )
        if ( error ) return res.status(400).json({ error })

        this.authService.registerUser( registerDto! )
            .then( user => res.json( user ))
            .catch( error => this.handleError( error, res ))
    }
    
    loginUser = ( req: Request, res: Response ) => {

        const [error, loginUserDto] = LoginUserDto.find(req.body)
        if (error) return res.status(400).json({ error })

        this.authService.loginUser(loginUserDto!)
            .then(user => res.json(user))
            .catch(error => this.handleError(error, res))
    }
    
    validateEamil = ( req: Request, res: Response ) => {

        res.json('Validate Email')
    }
}