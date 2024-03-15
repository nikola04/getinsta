// Changes page loading blur state
let page_loading = false
const startPageLoading = () => {
    page_loading = true
    document.querySelector('div#pageLoading').classList.add('active')
}
const stopPageLoading = () => {
    page_loading = false
    document.querySelector('div#pageLoading').classList.remove('active')
}

/**
 * Download page data as string
 * @param url Page URL
 * @returns Url response as String or NULL on Error
 */
const downloadPage = async (url: string): Promise<null|string> => {
    const data = await fetch(url, {
        method: 'GET'
    }).then(res => res.text()).catch(err => new Error(err))
    if(data instanceof Error) return null
    return data
}
/**
 * Parses page from string to HTML
 * @param page String page data
 * @returns HTML from div#mainWrapper Element
 */
const getAccountPageHTML = (page: string): Element => {
    const parser = new DOMParser()
    const html = parser.parseFromString(page, 'text/html')
    return html.querySelector('div#mainWrapper')
}
/**
 * Parses provided account page HTML to div#mainWrapper
 * @param html HTML page element
 */
const parseAccountPage = (html: Element): void => {
    document.querySelector('div#mainWrapper').replaceWith(html)
    return
}

/**
 * Loads page from another URL
 * @param url Page URL
 * @param pushState Add to window history
 */
const changePageToUrl = async (url: string, pushState: boolean = true): Promise<void> => {
    if(page_loading) return
    const current_url = location.href // In case of an error while downloading page
    startPageLoading()
    changeMenuButton(url)
    const page = await downloadPage(url)
    const html = getAccountPageHTML(page)
    if(!html) {
        window.location.href = url
        changeMenuButton(current_url)
        return stopPageLoading()
    }
    if(pushState) window.history.pushState({ url }, '', url)
    parseAccountPage(html)
    stopPageLoading()
    return
}

/**
 * Changes active page button based of provided page url
 * @param url URL of page
 */
const changeMenuButton = (url: string): void => {
    const menu = document.querySelector('div#sideMenu')
    menu.querySelectorAll('a.side-menu-item').forEach(item => {
        const button = item as HTMLAnchorElement
        if(button.href == url) return button.classList.add('active')
        button.classList.remove('active')
    })
}

// Window history event for changing pages
window.addEventListener('popstate', e => {
    if(!e.state || !e.state.url) return window.location.reload(); // If state url is not provided
    changePageToUrl(e.state.url, false)
})

// Window load event for caching Account Page
addEventListener('load', e => {
    const url = location.href.endsWith('/') ? location.href : `${location.href}/`
    window.history.replaceState({ url }, '', url)
})

// Side Menu buttons onclick event
document.querySelectorAll('a.side-menu-item').forEach((el) => el.addEventListener('click', e => {
    e.preventDefault()
    const element = el as HTMLAnchorElement
    const page_url = element.href
    changePageToUrl(page_url)
}))