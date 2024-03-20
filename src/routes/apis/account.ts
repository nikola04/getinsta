import { Router, Request, Response, urlencoded, json } from 'express';
import { rateLimit } from '../../middlewares/ratelimit';
import User from '../../../schemas/user';
import { EmailRegex } from '../../constants/regex';

const router = Router()

router.use(json())

router.delete('/', rateLimit({
    endpoint: '/account/delete',
    rateLimits: {
        loggedIn: {
            time: 1000,
            limit: 1
        },
        anonymous: null
    }
}, false), async (req: Request, res: Response) => {
    try{
        if(!req.signedIn || !req.user) return res.status(401).json({ error: 1, message: 'User is not logged in.' })
        const deleted = await User.deleteOne({ _id: req.user._id })
        if(!deleted) throw new Error('Error while deleting')
        return res.sendStatus(200)
    }catch(err){
        console.error(err)
        return res.status(500).json({ error: 0, message: String(err) })
    }
})

router.patch('/email', rateLimit({
    endpoint: '/account/email',
    rateLimits: {
        loggedIn: {
            time: 1000,
            limit: 1
        },
        anonymous: null
    }
}, false), async (req: Request, res: Response) => {
    try{
        const _email: null|string = req.body?.email
        if(!_email) return res.status(400).json({ error: 1, message: 'Email is not provided.' })
        const email = _email.trim()
        if(!EmailRegex.test(email)) return res.status(400).json({ error: 1, message: 'Provided Email is valid.' })
        if(!req.signedIn || !req.user) return res.status(401).json({ error: 2, message: 'User is not logged in.' })
        // Check if user is already using that mail
        const verified_email = req.user.google?.email === email
        await User.updateOne({ _id: req.user._id }, { $set: { email, verified_email }})
        return res.sendStatus(200)
    }catch(err){
        console.error(err)
        return res.status(500).json({ error: 0, message: String(err) })
    }
})

const validateName = (firstName: string, lastName: string): Boolean => {
    if(!firstName || !lastName) return false
    firstName = firstName.trim()
    lastName = lastName.trim()
    if(firstName.length == 0 || firstName.length > 36) return false
    if(lastName.length == 0 || lastName.length > 36) return false
    return true
}
router.patch('/name', rateLimit({
    endpoint: '/account/name',
    rateLimits: {
        loggedIn: {
            time: 1000,
            limit: 1
        },
        anonymous: null
    }
}, false), async (req: Request, res: Response) => {
    try{
        const firstName: null|string = req.body?.first_name
        const lastName: null|string = req.body?.last_name
        if(!validateName(firstName, lastName)) return res.status(400).json({ error: 1, message: 'Valid Name is not provided.' })
        if(!req.signedIn || !req.user) return res.status(401).json({ error: 2, message: 'User is not logged in.' })
        const name = ({
            first_name: firstName.trim(),
            last_name: lastName.trim()
        })
        await User.updateOne({ _id: req.user._id }, { $set: { name }})
        return res.sendStatus(200)
    }catch(err){
        console.error(err)
        return res.status(500).json({ error: 0, message: String(err) })
    }
})

function isStringTrueFalse(string: null|string): Boolean{
    if(!string || (string != 'false' && string != 'true')) return false;
    return true
}

router.patch('/settings', rateLimit({
    endpoint: '/account/name',
    rateLimits: {
        loggedIn: {
            time: 1000,
            limit: 1
        },
        anonymous: null
    }
}, false), async (req: Request, res: Response) => {
    try{
        const _securityEmails: null|string = req.body?.security_emails
        const _newsletterEmails: null|string = req.body?.newsletter_emails
        const _saveDownloads: null|string = req.body?.save_downloads
        if(!isStringTrueFalse(_securityEmails) || !isStringTrueFalse(_newsletterEmails) || !isStringTrueFalse(_saveDownloads)) return res.status(400).json({ error: 1, message: 'Provide valid body params.' })
        if(!req.signedIn || !req.user) return res.status(401).json({ error: 2, message: 'User is not logged in.' })

        const security_emails = _securityEmails === 'true' ? true : false
        const newsletter_emails = _newsletterEmails === 'true' ? true : false
        const save_downloads = _saveDownloads === 'true' ? true : false
        const email_preferences = {
            security_emails,
            newsletter_emails
        }
        await User.updateOne({ _id: req.user._id }, { $set: { email_preferences, save_downloads }})
        return res.sendStatus(200)
    }catch(err){
        console.error(err)
        return res.status(500).json({ error: 0, message: String(err) })
    }
})

export = router