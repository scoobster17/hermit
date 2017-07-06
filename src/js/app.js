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
import { serializeForm } from './utils/form-handling';

// configuration handlers
import { getPreconfiguredTabs } from './configurations/plugins.js';
import { getUserSettings, updateUserSettings } from './configurations/user.js';

// tab handlers
import { createTabs, bindTabTriggers } from './tabs/tab-handling';

/******************************************************************************/

/**
 * MAIN FUNCTIONALITY
 */

/**
 * Get DOM elements and cache them in an object for easy reference and to negate
 * the need to interrogate the DOM unnecessarily
 * @return {Object} Object where keys are bound to DOM elements
 */
const getDOMElements = () => {
    return {

        // section containing list of pre-configured sites
        preconfiguredTabsContainer: document.getElementById('pre-configured-tabs'),

        // list of configurations on the hermit tab
        preconfiguredTabs: document.getElementById('pre-configured-tabs-list'),

        // tabs (the actual tabs forming the nav, not their content)
        tabList: document.getElementById('hermit-nav'),

        // ultimate tab container (includes all tabs; hermit tab and dynamic)
        tabContentContainer: document.getElementById('tab-content-container'),

        // dynamic tabs container (doesn't include the Hermit tab shown on load)
        dynamicTabsContentContainer: document.getElementById('dynamic-tabs-content-container'),

        // section containing the add new site configuration form
        addNewSiteSection: document.getElementById('add-new-site'),

        // form used to add a new tab
        newTabForm: document.getElementById('new-tab-form')

    };
}

/**
 * Handle the add new tab form submission to add a new tab rather than navigate
 * to a new page or send a request to the server by default
 */
const bindAddTabFormSubmit = (elems) => {
    elems.newTabForm.addEventListener('submit', (event) => {
        event.preventDefault();

        // get the details that have been entered in the form, the existing tabs
        // and their content
        const tabDetails = serializeForm(event.target);
        const existingTabs = elems.tabList.querySelectorAll('a');
        const existingTabContentPanels = elems.tabContentContainer.querySelectorAll('.tab');

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
        createTabs([{ ...tabDetails, showTab: true }], elems);

        // add tab functionality to all tabs (specifically the new tab)
        bindTabTriggers();

        // save the configuration to the user's settings file stored locally
        updateUserSettings(tabDetails);

        return false;
    });
}

/**
 * Initialisation function to set up the app when electron opens a browser
 * window and loads the Hermit web app.
 */
const init = () => {

    // get elements in the DOM
    const elems = getDOMElements();

    // bind submit event to add a new tab configuration
    bindAddTabFormSubmit(elems);

    // fetch any configurations already set up by the user on the device
    getUserSettings(elems);

    // fetch any configurations that can be done by the hermit app
    getPreconfiguredTabs(elems);

}

// call the initialisation function when the page has loaded
window.addEventListener('load', init);
