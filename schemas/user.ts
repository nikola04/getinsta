import { Schema, model, Document } from "mongoose";

export enum PictureSource{
    Google = "google",
    User = "user"
}

export interface UserData extends Document{
    name: {
        first_name?: string,
        last_name?: string
    },
    email?: string,
    verified_email?: boolean,
    email_preferences: {
        security_emails: Boolean,
        newsletter_emails: Boolean
    },
    google: {
        id?: string,
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
        first_name: {
            type: String,
            default: null
        },
        last_name: {
            type: String,
            default: null
        }
    },
    email: {
        type: String,
        default: null
    },
    verified_email: {
        type: Boolean,
        default: false
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
    google: {
        id: {
            type: String,
            default: null
        },
        email: {
            type: String,
            default: null
        },
        picture: {
            type: String,
            default: null
        },
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