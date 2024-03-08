import { Router } from 'express';
import { rateLimit } from '../middlewares/ratelimit';
const router = Router()

// router.get('/', ratelimit({
//     endpoint: '/',
//     rateLimits: {
//         loggedIn: {
//             time: 1000,
//             limit: 5
//         },
//         anonymous: {
//             time: 500,
//             limit: 15
//         }
//     }
// }), (req, res) => {
//     res.render('instagram.ejs')
// })

export = router