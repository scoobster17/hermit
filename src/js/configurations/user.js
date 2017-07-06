// dependencies
import { createTabs, bindTabTriggers } from '../tabs/tab-handling';

// module-scope variable to hold DOM elements
let elems;

/**
 * Get any configurations that the user has set up previously from a locally
 * stored file
 */
export const getUserSettings = (DOMElements) => {

    // allow elems to be used in module's other functions
    elems = DOMElements;

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
            createTabs(tabs, elems);

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
 * Save a configuration to the user's local configuration file stored on the
 * device where the app is installed
 * @param  {Object} tabDetails Configuration object to be stored as-is
 */
export const updateUserSettings = (tabDetails) => {
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