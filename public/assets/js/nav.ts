// Features button click
let shown_features: boolean = false;
const show_features_button: null|HTMLElement = document.querySelector('#showFeaturesButton')
function showFeatures(){
    if(shown_features || !show_features_button) return;
    const features = document.querySelector('div#features')
    features?.setAttribute('style', 'opacity: 1; scale: 1;');
    show_features_button.dataset.active = 'true';
    shown_features = true;
}
function hideFeatures(){
    if(!shown_features || !show_features_button) return;
    const features = document.querySelector('div#features')
    features?.setAttribute('style', 'opacity: 0; scale: 0;')
    show_features_button.dataset.active = 'false';
    shown_features = false;
}

show_features_button?.addEventListener('click', e => {
    e.stopPropagation()
    hideAllUserPopups()
    showFeatures()
})

document.querySelector('#features')?.addEventListener('click', e => {
    hideAllUserPopups()
    e.stopPropagation()
})

// Feature platforms click
document.querySelectorAll('#features div.features-item[data-platform]').forEach(button => {
    const div = button as HTMLDivElement
    div.addEventListener('click', e => {
        const platform = div.dataset.platform;
        location.href = `/${platform}`;
    })
})

// WINDOW CLICK
window.addEventListener('click', e => {
    hideFeatures()
    hideAllUserPopups()
})

// User buttons
function hideAllUserPopups(...not_alllowed: string[]): boolean{
    let to_remove = 0;
    const buttons = document.querySelectorAll('div.nav-user-button') as NodeListOf<HTMLDivElement>
    buttons.forEach(button => button.dataset?.id && !not_alllowed.includes(button.dataset.id) && (to_remove++ || true) && button.parentElement?.classList.remove('active'))
    return to_remove > 0
}

document.querySelectorAll('div.nav-user-popup').forEach((el) => el.addEventListener('click', e => e.stopPropagation()))
document.querySelectorAll('div.nav-user-button').forEach((el) => el.addEventListener('click', e => {
    e.stopPropagation()
    const button: HTMLDivElement = el as HTMLDivElement
    const id = button.dataset.id
    if(!id) return
    hideFeatures()
    const hiding = hideAllUserPopups(id)
    if(hiding) setTimeout(() => button.parentElement?.classList.toggle('active'), 140)
    else button.parentElement?.classList.toggle('active')
}))
