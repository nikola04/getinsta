import { Schema, model, Document } from "mongoose";

export enum PictureSource{
    Google = "google",
    User = "user"
}

export interface UserData extends Document{
    name?: string,
    email?: string,
    verified_email?: boolean,
    google: {
        id: string,
        email?: string,
        picture?: string
    },
    picture: {
        url?: String,
        source?: PictureSource
    },
    created: Date
}

export const UserSchema = new Schema<UserData>({
    name: {
        type: String,
        default: null
    },
    email: {
        type: String,
        default: null
    },
    verified_email: {
        type: Boolean,
        default: false
    },
    google: {
        id: String,
        email: String,
        picture: String,
    },
    picture: {
        url: {
            type: String,
            default: null
        },
        source: {
            type: String,
            enum: PictureSource,
            default: null
        }
    },
    created: {
        type: Date,
        default: Date.now
    }
})

const User = model<UserData>('users', UserSchema)
export default User