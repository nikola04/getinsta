import { Schema, model, Document } from "mongoose";

export enum PictureSource{
    Google = "google",
    User = "user"
}

export interface UserData extends Document{
    name: null|string,
    google: {
        id: string,
        email: null|string,
        picture: null|string
    },
    picture: {
        url: null|String,
        source: null|PictureSource
    },
    created: Date
}

export const UserSchema = new Schema<UserData>({
    name: {
        type: String,
        default: null
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