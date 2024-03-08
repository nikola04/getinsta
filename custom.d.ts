declare namespace Express {
    export interface Request {
        signedIn?: boolean,
        user?: import('./schemas/user').UserData|null
    }
}