/**
 * Teamplate for the webview component
 * @type {Array} Array of HTML strings bound together into one string
 */
const template = [
    '<webview ',
        'id="{{ windowId }}" ',
        'class="{{ windowClasses }}" ',
        'src="{{ windowSrc }}" ',
    '>',
    '</webview>'
].join('');

/**
 * Create tab content from the data supplied, to append to the DOM
 * @param  {String} id      ID to assign to the tab
 * @param  {String} classes A list of classes to assign to the tab (can be 1)
 * @param  {String} src     Src of the tab
 * @return {String}         The returned HTML to be added to the DOM
 */
const createTabContent = function (id, classes, src) {

    let i = 0;

    tabContent = template.replace(/\{\{ [a-zA-Z]+ \}\}/g, (match) => {
        return '' + arguments[i++];
    });

    return tabContent;
};

const getPreconfiguredTabs = () => {
    fetch('/pre-configured-tabs')
    .then(res => console.log)
};

const init = () => {
    getPreconfiguredTabs();
    const tabContentContainer = document.getElementById('tab-content-container');
    const newTabForm = document.getElementById('new-tab-form');
    newTabForm.addEventListener('submit', (event) => {
        event.preventDefault();
        tabContentContainer.innerHTML += createTabContent('facebook','tab','https://www.facebook.com/');;
        return false;
    });
}

init();