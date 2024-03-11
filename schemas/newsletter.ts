import { Schema, Document, model } from "mongoose";

export interface NewsLetter extends Document{
    email: String,
    subscribed: Date
}

const NewsLetterSchema = new Schema<NewsLetter>({
    email: {
        type: String,
        required: true
    },
    subscribed: {
        type: Date,
        default: Date.now
    }
})

const Newsletter = model<NewsLetter>('newsletterSubscriptions', NewsLetterSchema)
export default Newsletter