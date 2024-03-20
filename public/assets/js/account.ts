interface SettingsPreferences{
    newsletter_emails?: boolean,
    security_emails?: boolean,
    save_downloads?: boolean
}
// @ts-ignore
const original_preferences = window.accountPreferences as SettingsPreferences
let current_preferences = { ...original_preferences }

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
 * Email validation
 * @returns True if email is valid or false when not
 */
function isValidEmail (email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * Add events when new page is loaded
 */
const attachEventsOnPageLoad = () => {
    document.querySelectorAll('a.navigation-button').forEach((el) => el.addEventListener('click', e => {
        e.preventDefault()
        const element = el as HTMLAnchorElement
        const page_url = element.href
        changePageToUrl(page_url)
    }))
    document.querySelector('form#updateNameData')?.addEventListener('submit', e => {
        e.preventDefault()
        const fNameEl = document.querySelector('input#firstNameInput') as null|HTMLInputElement
        const lNameEl = document.querySelector('input#lastNameInput') as null|HTMLInputElement
        if(!fNameEl || !lNameEl) return
        const first_name = fNameEl.value.trim(), last_name = lNameEl.value.trim()
        if(first_name.length == 0 || first_name.length > 36) return
        if(last_name.length == 0 || last_name.length > 36) return
        fetch('/api/account/name', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ first_name, last_name })
        }).then(res => {
            if(res.ok) changePageToUrl('/account/')
            else console.error(res.status)
        })
    })
    document.querySelector('form#updateEmailData')?.addEventListener('submit', e => {
        e.preventDefault()
        const emailEl = document.querySelector('input#emailInput') as null|HTMLInputElement
        if(!emailEl) return
        const email = emailEl.value.trim()
        if(email.length == 0 || !isValidEmail(email)) return
        fetch('/api/account/email', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        }).then(res => {
            if(res.ok) changePageToUrl('/account/')
            else console.error(res.status)
        })
    })
}

/**
 * Loads page from another URL
 * @param url Page URL
 * @param pushState Add to window history
 */
const changePageToUrl = async (url: string, pushState: boolean = true): Promise<void> => {
    if(page_loading) return
    const current_url = location.href // In case of an error while downloading page
    cancelPreferencesPopup()
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
    attachEventsOnPageLoad()
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
        if(button.href == url || (url.includes('/edit/') && button.href.endsWith('/account/'))) return button.classList.add('active')
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
    attachEventsOnPageLoad()
})

// Side Menu buttons onclick event
document.querySelectorAll('a.side-menu-item').forEach((el) => el.addEventListener('click', e => {
    e.preventDefault()
    const element = el as HTMLAnchorElement
    const page_url = element.href
    changePageToUrl(page_url)
}))

// SETTINGS PAGE
let show_again = null
const HIDE_ANIMATION_TIME = 500
/**
 * Show preference popup
 */
const showPreferencesPopup = () => {
    if(saving_preferences) setTimeout(showPreferencesPopup, 25)
    document.querySelector("#saveChangesPopup").classList.add('active')
}
/**
 * Close preference popup
 */
const closePreferencesPopup = () => {
    const popup = document.querySelector("div#saveChangesPopup") as HTMLDivElement
    if(!popup || !popup.classList.contains('active')) return
    setTimeout(() => {
        popup.classList.remove('active')
        popup.style.animation = ''
        saving_preferences = false
    }, HIDE_ANIMATION_TIME)
    popup.style.animation = 'bounceHide .5s ease'
}

/**
 * Reset preferences to original value
 */
const resetPreferences = () => {
    const secEmails = document.querySelector('input[data-name="security-emails"') as HTMLInputElement
    const newsEmails = document.querySelector('input[data-name="newsletter-emails"') as HTMLInputElement
    const saveDwnlds = document.querySelector('input[data-name="save-downloads"') as HTMLInputElement
    if(newsEmails) newsEmails.checked = original_preferences.newsletter_emails
    if(secEmails) secEmails.checked = original_preferences.security_emails
    if(saveDwnlds) saveDwnlds.checked = original_preferences.save_downloads
    current_preferences = ({ 
        ...original_preferences
    })
}
/**
 * Prefrence change value event
 * @param element 
 */
const preferenceChange = (element: HTMLInputElement): void => {
    if(!element.dataset.name) return
    const name = element.dataset.name
    const value = element.checked
    if(name === 'security-emails') current_preferences.security_emails = value
    if(name === 'newsletter-emails') current_preferences.newsletter_emails = value
    if(name === 'save-downloads') current_preferences.save_downloads = value
    showPreferencesPopup()
}
let saving_preferences = false
/**
 * Save prefrence - API call
 */
const savePreferences = () => {
    if(saving_preferences) return
    saving_preferences = true
    // start loading
    const button = document.querySelector('button#preferenceSaveButton')
    button.classList.add('loading')
    const temp = {...current_preferences}
    fetch('https://getinsta.xyz/api/account/settings', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            newsletter_emails: String(temp.newsletter_emails),
            security_emails: String(temp.security_emails),
            save_downloads: String(temp.save_downloads)
        })
    }).then(res => {
        button.classList.remove('loading')
        if(!res.ok) {
            resetPreferences()
            closePreferencesPopup()
            return
        }
        const HOLD_TIME = 1000
        setTimeout(closePreferencesPopup, HOLD_TIME)
        button.classList.add('saved')
        setTimeout(() => button.classList.remove('saved'), HIDE_ANIMATION_TIME + HOLD_TIME)
        original_preferences.newsletter_emails = temp.newsletter_emails
        original_preferences.security_emails = temp.security_emails
        original_preferences.save_downloads = temp.save_downloads
    }).catch(error => null)
}
const cancelPreferencesPopup = () => {
    resetPreferences()
    closePreferencesPopup()
}