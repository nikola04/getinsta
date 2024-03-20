import dotenv from 'dotenv'; 
dotenv.config()

export interface ValidateTokenData{
    token: string,
    ip?: string
}
export interface RecaptchaResponse{
    score?: number;
    success: boolean,
    challenge_ts: Date,
    hostname: string,
    action?: string
}

export async function validateCaptchaToken({ token, ip }: ValidateTokenData): Promise<null|RecaptchaResponse>{
    try{
        const secret = process.env.RECAPTCHA_SECRET ?? ''
        const ip_param = ip ? `&remoteip=${encodeURIComponent(ip)}` : ''
        const data = await fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}${ip_param}`
        }).then(res => res.json())
        .catch(err => new Error(err))
        if(data instanceof Error) throw data
        return data
    }catch(err){
        console.error(err)
        return null
    }
}

export function validateCatpchaResponse(response: null|RecaptchaResponse, action: string): boolean{
    if(!response) return false
    if(response.action !== action) return false
    if(!response.success) return false
    return true
}