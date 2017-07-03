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

const buttonTemplate = [
    '<button ',
        'data-url="{{ url }}" ',
        'data-site="{{ site }}" ',
    '>',
        '{{ name }}',
        '<img src="img/service/{{ name | lowercase }}/{{ logo }}" alt="" />',
    '</button>'
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

    tabContent = template.replace(/\{\{ ?([a-zA-Z]+) ?\}\}/g, () => {
        return '' + arguments[i++];
    });

    return tabContent;
};

const createButton = (config) => {

        let i = 0;

        const buttonContent = buttonTemplate.replace(/\{\{ ?([a-zA-Z]+)( ?\| ?([a-zA-Z]+))? ?\}\}/g, function(){

            // get the filter and the key
            const key = arguments[1];
            const filter = arguments[3];

            // if there is a filter, we need to process the key's value
            if (filter !== undefined) {

                switch (filter) {

                    case 'lowercase':
                        return '' + config[key].toLowerCase();
                        break;

                    default:
                        return '' + config[key];

                }

            // otherwise return the corresponding config value
            } else {
                return '' + config[key];
            }

        });

        return buttonContent;
};

const tabContentContainer = document.getElementById('tab-content-container');
var preconfiguredTabs = document.getElementById('pre-configured-tabs');

const getPreconfiguredTabs = () => {
    fetch('/pre-configured-tabs')
    .then(res => {
        if (res.ok) return res;
        throw new Error('There was an error');
    })
    .then(res => res.json())
    .then(res => {
        res.forEach((siteConfig) => {
            preconfiguredTabs.innerHTML += '<li>' + createButton(siteConfig) + '</li>';
        });
        return res;
    })
    .then(res => {
        var buttons = preconfiguredTabs.getElementsByTagName('button');
        for (button of buttons) {
            button.addEventListener('click', function(event) {
                for (let attr in event.target.dataset) {
                    const formInput = document.getElementById(attr);
                    if (formInput) {
                        formInput.value = event.target.dataset[attr];
                    }
                }
                const formInput = document.getElementById('name');
                if (formInput) {
                    formInput.value = event.target.innerHTML;
                }
            });
        }
    });
};

const init = () => {
    getPreconfiguredTabs();
    const newTabForm = document.getElementById('new-tab-form');
    newTabForm.addEventListener('submit', (event) => {
        event.preventDefault();
        tabContentContainer.innerHTML += createTabContent('facebook','tab','https://www.facebook.com/');
        return false;
    });
}

init();