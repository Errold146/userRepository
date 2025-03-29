import { Schema, model } from "mongoose";

const userSchema = new Schema({

    name: {
        type: String,
        required: [ true, 'Name is required' ]
    },
    email: {
        type: String,
        required: [ true, 'Email is required'] ,
        unique: true
    },
    emailValidated: {
        type: Boolean,
        default: false,
    },
    password: {
        type: String,
        required: [ true, 'Password is required' ]
    },
    img: {
        type: String
    },
    role: {
        type: [ String ],
        default: [ 'User' ],
        enum: [ 'Admin', 'User' ]
    }
})

userSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret, options) {
        delete ret._id
        delete ret.password
        delete ret.emailValidated
        delete ret.role
    },
})

export const UserModel = model( 'User', userSchema )