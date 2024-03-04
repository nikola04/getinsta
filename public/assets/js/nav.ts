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
    showFeatures()
})

document.querySelector('#features')?.addEventListener('click', e => {
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
})