import { Schema, model, Document } from "mongoose";

export enum PictureSource{
    Google = "google",
    User = "user"
}

export interface UserData extends Document{
    name?: string,
    email?: string,
    email_preferences: {
        security_emails: Boolean,
        newsletter_emails: Boolean
    },
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
    save_downloads: Boolean,
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
    email_preferences: {
        security_emails: {
            type: Boolean,
            default: true
        },
        newsletter_emails: {
            type: Boolean,
            default: false
        }
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
    save_downloads: {
        type: Boolean,
        default: true
    },
    created: {
        type: Date,
        default: Date.now
    }
})

const User = model<UserData>('users', UserSchema)
export default User