import { Router } from 'express';
const router = Router()

const getUserDataByDocId = async (graphql_id: number) => {
    return await fetch("https://www.instagram.com/api/graphql", {
        "headers": {
          "content-type": "application/x-www-form-urlencoded",
          "sec-fetch-site": "same-origin",
          "viewport-width": "2560",
        },
        "body": `__user=0&variables=%7B%22id%22%3A%2247693668664%22%2C%22render_surface%22%3A%22PROFILE%22%7D&server_timestamps=true&doc_id=${graphql_id}`,
        "method": "POST"
      }).then(res => res.json())
}

router.get('/:username', async (req, res) => {
    // const data = await getUserDataByDocId(7207577662652222);
    // res.json(data)
})

router.get('/', (req, res) => {
    res.render('instagram.ejs')
})

export = router