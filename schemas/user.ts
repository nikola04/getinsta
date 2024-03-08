import { Schema, Types, model } from "mongoose";

export enum PictureSource{
    Google = "google"
}

export interface UserData{
    _id: Types.ObjectId,
    google_id: null|string,
    name: null|string,
    picture: {
        url: null|String,
        source: null|PictureSource
    }
}

export const UserSchema = new Schema<UserData>({
    google_id: String,
    name: {
        type: String,
        default: null
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
    }
})

const User = model<UserData>('users', UserSchema)
export default User