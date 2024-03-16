import { Schema, Document, model } from "mongoose";

interface APICall extends Document{
    api: string,
    account_id?: Schema.Types.ObjectId,
    ip?: string,
    ua?: string,
    called: Date
}

const APICallsSchema = new Schema<APICall>({
    api: {
        type: String,
        required: true
    },
    account_id: {
        type: Schema.ObjectId,
        default: null
    },
    ip: {
        type: String,
        default: null
    },
    ua: {
        type: String,
        default: null
    },
    called: {
        type: Date,
        default: Date.now
    }
})

const ApiCall = model<APICall>('apicalls', APICallsSchema)
export default ApiCall