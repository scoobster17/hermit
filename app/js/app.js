/**
 * Teamplate for the webview component
 * @type {Array} Array of HTML strings bound together into one string
 */
const template = [
    '<webview ',
        'id="{{ id }}-webview" ',
        'src="{{ url }}" ',
    '>',
    '</webview>'
].join('');

const buttonTemplate = [
    '<button ',
        'data-name="{{ name }}" ',
        'data-site="{{ site }}" ',
        'data-url="{{ url }}" ',
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
const createTabContent = function (config) {

    let i = 0;

    tabContent = template.replace(/\{\{ ?([a-zA-Z]+) ?\}\}/g, function() {
        return '' + config[arguments[1]];
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
        var addNewSiteSection = document.getElementById('add-new-site');
        var buttons = preconfiguredTabs.getElementsByTagName('button');
        for (button of buttons) {
            button.addEventListener('click', function(event) {
                for (let attr in event.target.dataset) {
                    const formInput = document.getElementById(attr);
                    if (formInput) {
                        formInput.value = event.target.dataset[attr];
                    }
                }
                // attempt at UX for now (TODO smooth scroll)
                addNewSiteSection.scrollIntoView();
            });
            const buttonImg = button.querySelector('img');
            if (buttonImg) button.addEventListener('click', (event) => {
                event.target.parentElement.click();
            });
        }
    });
};

const tabList = document.getElementById('hermit-nav');

const bindTabTriggers = () => {

    const tabs = tabList.querySelectorAll('a');
    const tabPanels = tabContentContainer.querySelectorAll('.tab');

    tabs.forEach((tab) => {
        tab.addEventListener('click', (event) => {
            event.preventDefault();

            tabs.forEach((tabChangingStateOf) => {
                tabChangingStateOf.removeAttribute('aria-selected');
            });
            event.target.setAttribute('aria-selected', 'true');

            const targetTab = document.getElementById(
                event.target.getAttribute('href').slice(1)
            );
            tabPanels.forEach((tabPanel) => {
                tabPanel.setAttribute('aria-hidden', 'true');
            });
            targetTab.removeAttribute('aria-hidden');
        });
    });
};

const serializeForm = (form) => {

    const formDetails = {};
    const formInputs = form.querySelectorAll('input[type="text"]');

    formInputs.forEach((input) => {
        formDetails[input.name] = input.value;
    });

    return formDetails;

};

const getUserTabs = () => {
    fetch('/user/settings/get')
    .then(res => {
        if (res.ok) return res;
        throw new Error('There was an error');
    })
    .then(res => res.json())
    .then(res => {
        var tabs = JSON.parse(res.data);
        if (tabs) tabs.forEach((tab) => {
            createTab(tab, false);
            bindTabTriggers();
        });
    });
};

const createTab = (tabDetails, showTab = true) => {
    tabContentContainer.innerHTML += `<div id="${ tabDetails.id }" class="tab" role="tabpanel" aria-labelledby="tab-${ tabDetails.name }" ${ showTab ? '' : 'aria-hidden="true" ' }>` + createTabContent({
        id: tabDetails.id,
        url: tabDetails.url
    }) + '</div>';
    tabList.innerHTML += [
        '<li>',
            `<a href="#${ tabDetails.id }" id="tab-${ tabDetails.name }" role="tab" aria-controls="${ tabDetails.id }" ${ showTab ? 'aria-selected="true" ' : '' }>`,
                tabDetails.name,
            '</a>',
        '</li>'
    ].join('');
};

const init = () => {
    getPreconfiguredTabs();
    getUserTabs();

    const newTabForm = document.getElementById('new-tab-form');
    newTabForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const tabDetails = serializeForm(event.target);
        tabDetails.id = `hermit-${ new Date().getTime() }`;

        fetch('/user/settings/set', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(tabDetails)
        })
        .then(res => {
            if (res.ok) return res;
            throw new Error('There was an error');
        })
        .then(res => {
            console.log(res);
        });

        const existingTabPanels = tabContentContainer.querySelectorAll('.tab');
        existingTabPanels.forEach((tab) => {
            tab.setAttribute('aria-hidden', 'true');
        });
        const tabs = tabList.querySelectorAll('a');

        tabs.forEach((tab) => {
            tab.removeAttribute('aria-selected');
        });

        createTab(tabDetails);
        bindTabTriggers();
        return false;
    });
}
window.addEventListener('load', init);
