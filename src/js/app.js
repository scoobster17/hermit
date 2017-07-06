/******************************************************************************/

/**
 * Hermit Shell Browser tabs app Javascript file
 * @author Phil Gibbins (@Scoobster17)
 */

'use strict';

/******************************************************************************/

/**
 * DEPENDENCIES
 */

// utilities
import { serializeForm } from './utils/formHandling';

/******************************************************************************/

/**
 * BINDING ELEMENTS
 */

// section containing list of pre-configured sites
const preconfiguredTabsContainer = document.getElementById('pre-configured-tabs');

// list of configurations on the hermit tab
const preconfiguredTabs = document.getElementById('pre-configured-tabs-list');

// tabs
const tabList = document.getElementById('hermit-nav');

// ultimate tab container
const tabContentContainer = document.getElementById('tab-content-container');

// dynamic tabs container
const dynamicTabsContentContainer = document.getElementById('dynamic-tabs-content-container');

// form used to add a new tab
const newTabForm = document.getElementById('new-tab-form');

/******************************************************************************/

/**
 * MAIN FUNCTIONALITY
 */

/**
 * Get all configurations for supported sites from the local plugins folder
 */
const getPreconfiguredTabs = () => {
    fetch('/pre-configured-tabs')
    .then(res => {
        if (res.ok) return res.json();
        throw new Error('There was an error fetching pre-configured tabs');
    })
    .then(addPreconfiguredSiteButtons)
    .catch(err => {
        console.error(err);

        // if there is an error, simply hide the section providing this
        // functionality, as it is not available
        preconfiguredTabsContainer.setAttribute('aria-hidden', 'true');
    });
};

/**
 * Add buttons to the DOM for site configurations found in the local file system
 * @param  {Array} siteConfigs  An array of site configuration objects found in
 *                              the local file system, which can pre-populate
 *                              the form to add a new tab
 */
const addPreconfiguredSiteButtons = (siteConfigs) => {

    let html = '';
    const addNewSiteSection = document.getElementById('add-new-site');

    // loop through the list of configurations, appending the button template
    // with dynamic data to the html variable
    siteConfigs.forEach((siteConfig) => {
        html += [
            '<li>',
                '<button ',
                    `data-name="${ siteConfig.name }" `,
                    `data-site="${ siteConfig.site }" `,
                    `data-url="${ siteConfig.url }" `,
                '>',
                    siteConfig.name,
                    `<img src="img/service/${ siteConfig.name.toLowerCase() }/${ siteConfig.logo }" alt="" />`,
                '</button>',
            '</li>'
        ].join('');
    });

    // append this html to the DOM
    preconfiguredTabs.innerHTML = html;

    // once the HTML has been appended to the DOM, find the button elements
    const buttons = preconfiguredTabs.getElementsByTagName('button');

    // loop through the appended buttons and add a click event to populate form
    for (let button of buttons) {
        button.addEventListener('click', function(event) {

            // loop through the data- attributes and fill the matching field
            for (let attr in button.dataset) {
                const formInput = document.getElementById(attr);
                if (formInput) {
                    formInput.value = button.dataset[attr];
                }
            }

            // attempt at UX for now (TODO smooth scroll)
            addNewSiteSection.scrollIntoView();
        });
    }
};

/**
 * Add click events to tabs to hide all other tabs and show the content of the
 * selected tab
 */
const bindTabTriggers = () => {

    // get the tabs and their content at the time of event binding to catch any
    // new tabs that may have been added to the DOM
    const tabs = tabList.querySelectorAll('a');
    const tabContentPanels = tabContentContainer.querySelectorAll('.tab');

    // loop through the tabs adding a click event to hide all other tabs'
    // content and show the tab content related to the tab being clicked
    tabs.forEach((tab) => {
        tab.addEventListener('click', (event) => {
            event.preventDefault();

            // get the tab content that relates to the tab being clicked
            const targetTab = document.getElementById(
                event.target.getAttribute('href').slice(1)
            );

            // remove state from selected tab(s)
            tabs.forEach((tabChangingStateOf) => {
                tabChangingStateOf.removeAttribute('aria-selected');
            });

            // add state to newly selected tab
            event.target.setAttribute('aria-selected', 'true');

            // hide all other tabs' content
            tabContentPanels.forEach((tabPanel) => {
                tabPanel.setAttribute('aria-hidden', 'true');
            });

            // show the relevant tab content
            targetTab.removeAttribute('aria-hidden');
        });
    });
};

/**
 * Get any configurations that the user has set up previously from a locally
 * stored file
 */
const getUserTabs = () => {
    fetch('/user/settings/get')
    .then(res => {
        if (res.ok) return res.json();
        throw new Error('There was an error fetching the user\'s settings');
    })
    .then(res => {
        var tabs = JSON.parse(res.data);
        if (tabs) {

            // on load, the hermit tab should be shown, so all other tabs should
            // have a showTab value of false. Looping through and adding here
            tabs.forEach((tab) => {
                tab.showTab = false;
            });

            // create the tabs in the DOM
            createTabs(tabs);

            // add click events to the new tabs so they work!
            bindTabTriggers();
        };
    })
    // not a problem if none fetched, we simply want to to log the error at this
    // stage. Nothing is added to the DOM, and nothing needs to be hidden.
    // TODO: let the user know there was an error
    .catch(console.error);
};

/**
 * Create tab(s) and add them to the DOM
 * @param  {Array} tabs     Array of objects containing configuration for each
 *                          tab and it's content
 */
const createTabs = (tabs) => {

    let tabsHTML = '';
    let tabsContentHTML = '';

    // loop through the tabs and create both a tab for the nav and it's
    // respective content, appending each of these to the relevant html string
    tabs.forEach((tab) => {

        tabsHTML += [
            '<li>',
                '<a ',
                    `href="#${ tab.id }" `,
                    `id="tab-${ tab.name }" `,
                    'role="tab" ',
                    `aria-controls="${ tab.id }" `,
                    `${ tab.showTab ? 'aria-selected="true" ' : '' }`,
                '>',
                    tab.name,
                '</a>',
            '</li>'
        ].join('');

        tabsContentHTML += [
            '<div ',
                `id="${ tab.id }" `,
                'class="tab" ',
                'role="tabpanel" ',
                `aria-labelledby="tab-${ tab.name }" `,
                `${ tab.showTab ? '' : 'aria-hidden="true" ' }`,
            '>',
                '<webview ',
                    `id="${ tab.id }-webview" `,
                    `src="${ tab.url }" `,
                '>',
                '</webview>',
            '</div>'
        ].join('');

    });

    // bind each of the HTML strings to the DOM
    tabList.innerHTML += tabsHTML;
    dynamicTabsContentContainer.innerHTML += tabsContentHTML;

};

/**
 * Handle the add new tab form submission to add a new tab rather than navigate
 * to a new page or send a request to the server by default
 */
const bindAddTabFormSubmit = () => {
    newTabForm.addEventListener('submit', (event) => {
        event.preventDefault();

        // get the details that have been entered in the form, the existing tabs
        // and their content
        const tabDetails = serializeForm(event.target);
        const existingTabs = tabList.querySelectorAll('a');
        const existingTabContentPanels = tabContentContainer.querySelectorAll('.tab');

        // add a unique ID to the tab for use in the DOM (so each tab is linked
        // with it's content). getTime() returns a millisecond string on
        // execution, and time is forever moving forward so will suffice for now
        tabDetails.id = `hermit-${ new Date().getTime() }`;

        // TODO: form validation

        // remove selected state from tabs
        existingTabs.forEach((tab) => {
            tab.removeAttribute('aria-selected');
        });

        // hide all existing tabs' content
        existingTabContentPanels.forEach((tab) => {
            tab.setAttribute('aria-hidden', 'true');
        });

        // create the new tab, having set it to show by default
        createTabs([{ ...tabDetails, showTab: true }]);

        // add tab functionality to all tabs (specifically the new tab)
        bindTabTriggers();

        // save the configuration to the user's settings file stored locally
        updateUserSettings(tabDetails);

        return false;
    });
}

/**
 * Save a configuration to the user's local configuration file stored on the
 * device where the app is installed
 * @param  {Object} tabDetails Configuration object to be stored as-is
 */
const updateUserSettings = (tabDetails) => {
    fetch('/user/settings/set', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(tabDetails)
    })
    .then(res => {
        if (res.ok) return res.json();
        throw new Error('There was an error updating user settings');
    })
    // not a problem if not saved, we simply want to to log the error at this
    // stage. Tab is still added to the DOM, it's just when the app is quit and
    // re-opened it will not re-appear. This will be frustrating and need fixing
    // TODO: let the user know there was an error
    .catch(console.error);
}

/**
 * Initialisation function to set up the app when electron opens a browser
 * window and loads the Hermit web app.
 */
const init = () => {

    // fetch any configurations that can be done by the hermit app
    getPreconfiguredTabs();

    // fetch any configurations already set up by the user on the device
    getUserTabs();

    // bind submit event to add a new tab configuration
    bindAddTabFormSubmit();
}

// call the initialisation function when the page has loaded
window.addEventListener('load', init);
