import jwt from "jsonwebtoken"
import { envs } from "./envs";

const secret = envs.JWT_SEED

export class JwtAdapter {

    static async generateToken( payload: any, duration: string = '2h' ) {
        return new Promise( resolve => {
            jwt.sign( 
                payload, 
                secret as jwt.Secret, 
                { expiresIn: duration as jwt.SignOptions['expiresIn'] }, 
                ( err, token ) => {
                    
                    if ( err ) return resolve( null );
                    resolve( token )
                }
            ) 
        })
    }

    static validateToken<T>( token: string ): Promise< T | null > { 
        return new Promise( resolve => {
            jwt.verify( token, secret, ( err, decoded ) => {
                if ( err ) return resolve( null );
                resolve( decoded as T )
            })
        })
    }
}