(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

// configuration handlers


// tab handlers


var _formHandling = require('./utils/form-handling');

var _plugins = require('./configurations/plugins.js');

var _user = require('./configurations/user.js');

var _tabHandling = require('./tabs/tab-handling');

/******************************************************************************/

/**
 * MAIN FUNCTIONALITY
 */

/**
 * Get DOM elements and cache them in an object for easy reference and to negate
 * the need to interrogate the DOM unnecessarily
 * @return {Object} Object where keys are bound to DOM elements
 */
var getDOMElements = function getDOMElements() {
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
};

/**
 * Handle the add new tab form submission to add a new tab rather than navigate
 * to a new page or send a request to the server by default
 */
var bindAddTabFormSubmit = function bindAddTabFormSubmit(elems) {
    elems.newTabForm.addEventListener('submit', function (event) {
        event.preventDefault();

        // get the details that have been entered in the form, the existing tabs
        // and their content
        var tabDetails = (0, _formHandling.serializeForm)(event.target);
        var existingTabs = elems.tabList.querySelectorAll('a');
        var existingTabContentPanels = elems.tabContentContainer.querySelectorAll('.tab');

        // add a unique ID to the tab for use in the DOM (so each tab is linked
        // with it's content). getTime() returns a millisecond string on
        // execution, and time is forever moving forward so will suffice for now
        tabDetails.id = 'hermit-' + new Date().getTime();

        // TODO: form validation

        // remove selected state from tabs
        existingTabs.forEach(function (tab) {
            tab.removeAttribute('aria-selected');
        });

        // hide all existing tabs' content
        existingTabContentPanels.forEach(function (tab) {
            tab.setAttribute('aria-hidden', 'true');
        });

        // create the new tab, having set it to show by default
        (0, _tabHandling.createTabs)([_extends({}, tabDetails, { showTab: true })], elems);

        // add tab functionality to all tabs (specifically the new tab)
        (0, _tabHandling.bindTabTriggers)();

        // save the configuration to the user's settings file stored locally
        (0, _user.updateUserSettings)(tabDetails);

        return false;
    });
};

/**
 * Initialisation function to set up the app when electron opens a browser
 * window and loads the Hermit web app.
 */
var init = function init() {

    // get elements in the DOM
    var elems = getDOMElements();

    // bind submit event to add a new tab configuration
    bindAddTabFormSubmit(elems);

    // fetch any configurations already set up by the user on the device
    (0, _user.getUserSettings)(elems);

    // fetch any configurations that can be done by the hermit app
    (0, _plugins.getPreconfiguredTabs)(elems);
};

// call the initialisation function when the page has loaded
window.addEventListener('load', init);

},{"./configurations/plugins.js":2,"./configurations/user.js":3,"./tabs/tab-handling":4,"./utils/form-handling":5}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
// module-scope variable to hold DOM elements
var elems = void 0;

/**
 * Get all configurations for supported sites from the local plugins folder
 */
var getPreconfiguredTabs = exports.getPreconfiguredTabs = function getPreconfiguredTabs(DOMElements) {

    // allow elems to be used in module's other functions
    elems = DOMElements;

    fetch('/pre-configured-tabs').then(function (res) {
        if (res.ok) return res.json();
        throw new Error('There was an error fetching pre-configured tabs');
    }).then(function (res) {
        return addPreconfiguredSiteButtons(res, elems);
    }).catch(function (err) {
        console.error(err);

        // if there is an error, simply hide the section providing this
        // functionality, as it is not available
        elems.preconfiguredTabsContainer.setAttribute('aria-hidden', 'true');
    });
};

/**
 * Add buttons to the DOM for site configurations found in the local file system
 * @param  {Array} siteConfigs  An array of site configuration objects found in
 *                              the local file system, which can pre-populate
 *                              the form to add a new tab
 */
var addPreconfiguredSiteButtons = function addPreconfiguredSiteButtons(siteConfigs) {

    var html = '';

    // loop through the list of configurations, appending the button template
    // with dynamic data to the html variable
    siteConfigs.forEach(function (siteConfig) {
        html += ['<li>', '<button ', 'data-name="' + siteConfig.name + '" ', 'data-site="' + siteConfig.site + '" ', 'data-url="' + siteConfig.url + '" ', '>', siteConfig.name, '<img src="img/service/' + siteConfig.name.toLowerCase() + '/' + siteConfig.logo + '" alt="" />', '</button>', '</li>'].join('');
    });

    // append this html to the DOM
    elems.preconfiguredTabs.innerHTML = html;

    // once the HTML has been appended to the DOM, find the button elements
    var buttons = elems.preconfiguredTabs.getElementsByTagName('button');

    // loop through the appended buttons and add a click event to populate form

    var _loop = function _loop(button) {
        button.addEventListener('click', function (event) {

            // loop through the data- attributes and fill the matching field
            for (var attr in button.dataset) {
                var formInput = document.getElementById(attr);
                if (formInput) {
                    formInput.value = button.dataset[attr];
                }
            }

            // attempt at UX for now (TODO smooth scroll)
            elems.addNewSiteSection.scrollIntoView();
        });
    };

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = buttons[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var button = _step.value;

            _loop(button);
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }
};

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.updateUserSettings = exports.getUserSettings = undefined;

var _tabHandling = require('../tabs/tab-handling');

// module-scope variable to hold DOM elements
var elems = void 0;

/**
 * Get any configurations that the user has set up previously from a locally
 * stored file
 */
// dependencies
var getUserSettings = exports.getUserSettings = function getUserSettings(DOMElements) {

    // allow elems to be used in module's other functions
    elems = DOMElements;

    fetch('/user/settings/get').then(function (res) {
        if (res.ok) return res.json();
        throw new Error('There was an error fetching the user\'s settings');
    }).then(function (res) {
        var tabs = JSON.parse(res.data);
        if (tabs) {

            // on load, the hermit tab should be shown, so all other tabs should
            // have a showTab value of false. Looping through and adding here
            tabs.forEach(function (tab) {
                tab.showTab = false;
            });

            // create the tabs in the DOM
            (0, _tabHandling.createTabs)(tabs, elems);

            // add click events to the new tabs so they work!
            (0, _tabHandling.bindTabTriggers)();
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
var updateUserSettings = exports.updateUserSettings = function updateUserSettings(tabDetails) {
    fetch('/user/settings/set', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(tabDetails)
    }).then(function (res) {
        if (res.ok) return res.json();
        throw new Error('There was an error updating user settings');
    })
    // not a problem if not saved, we simply want to to log the error at this
    // stage. Tab is still added to the DOM, it's just when the app is quit and
    // re-opened it will not re-appear. This will be frustrating and need fixing
    // TODO: let the user know there was an error
    .catch(console.error);
};

},{"../tabs/tab-handling":4}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
// module-scope variable to hold DOM elements
var elems = void 0;

/**
 * Create tab(s) and add them to the DOM
 * @param  {Array} tabs         Array of objects containing configuration for each
 *                              tab and it's content
 * @param {Object} DOMElements  Object containing elements in the DOM
 */
var createTabs = exports.createTabs = function createTabs(tabs, DOMElements) {

    // allow elems to be used in module's other functions
    elems = DOMElements;

    var tabsHTML = '';
    var tabsContentHTML = '';

    // loop through the tabs and create both a tab for the nav and it's
    // respective content, appending each of these to the relevant html string
    tabs.forEach(function (tab) {

        tabsHTML += ['<li>', '<a ', 'href="#' + tab.id + '" ', 'id="tab-' + tab.name + '" ', 'role="tab" ', 'aria-controls="' + tab.id + '" ', '' + (tab.showTab ? 'aria-selected="true" ' : ''), '>', tab.name, '</a>', '</li>'].join('');

        tabsContentHTML += ['<div ', 'id="' + tab.id + '" ', 'class="tab" ', 'role="tabpanel" ', 'aria-labelledby="tab-' + tab.name + '" ', '' + (tab.showTab ? '' : 'aria-hidden="true" '), '>', '<webview ', 'id="' + tab.id + '-webview" ', 'src="' + tab.url + '" ', 'partition="persist:' + tab.name + '"', '>', '</webview>', '</div>'].join('');
    });

    // bind each of the HTML strings to the DOM
    elems.tabList.innerHTML += tabsHTML;
    elems.dynamicTabsContentContainer.innerHTML += tabsContentHTML;

    var x = document.querySelectorAll('webview')[1];
    x.addEventListener("did-get-redirect-request", function (e) {
        console.log(e);
        setTimeout(function () {
            x.executeJavaScript('window.onbeforeunload = function(event){console.log(event);return \'Are you sure you want to leave?\';};window.location = \'' + e.newURL + '\';');
        }, 10);
        e.preventDefault();
    });
};

/**
 * Add click events to tabs to hide all other tabs and show the content of the
 * selected tab
 */
var bindTabTriggers = exports.bindTabTriggers = function bindTabTriggers() {

    // get the tabs and their content at the time of event binding to catch any
    // new tabs that may have been added to the DOM
    var tabs = elems.tabList.querySelectorAll('a');
    var tabContentPanels = elems.tabContentContainer.querySelectorAll('.tab');

    // loop through the tabs adding a click event to hide all other tabs'
    // content and show the tab content related to the tab being clicked
    tabs.forEach(function (tab) {
        tab.addEventListener('click', function (event) {
            event.preventDefault();

            // get the tab content that relates to the tab being clicked
            var targetTab = document.getElementById(event.target.getAttribute('href').slice(1));

            // remove state from selected tab(s)
            tabs.forEach(function (tabChangingStateOf) {
                tabChangingStateOf.removeAttribute('aria-selected');
            });

            // add state to newly selected tab
            event.target.setAttribute('aria-selected', 'true');

            // hide all other tabs' content
            tabContentPanels.forEach(function (tabPanel) {
                tabPanel.setAttribute('aria-hidden', 'true');
            });

            // show the relevant tab content
            targetTab.removeAttribute('aria-hidden');
        });
    });
};

},{}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
 * Serialize a form, returning a JSON object of key/value pairs based on the
 * names of input fields
 * @param  {Element} form   The form element being serialized
 * @return {Object}         Object containing names/values of all form fields
 */
var serializeForm = exports.serializeForm = function serializeForm(form) {

    var formDetails = {};
    var formInputs = form.querySelectorAll('input[type="text"]');

    formInputs.forEach(function (input) {
        formDetails[input.name] = input.value;
    });

    return formDetails;
};

},{}]},{},[1]);
