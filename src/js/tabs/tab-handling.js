// module-scope variable to hold DOM elements
let elems;

/**
 * Create tab(s) and add them to the DOM
 * @param  {Array} tabs         Array of objects containing configuration for each
 *                              tab and it's content
 * @param {Object} DOMElements  Object containing elements in the DOM
 */
export const createTabs = (tabs, DOMElements) => {

    // allow elems to be used in module's other functions
    elems = DOMElements;

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
                    `partition="persist:${ tab.name }"`,
                '>',
                '</webview>',
            '</div>'
        ].join('');

    });

    // bind each of the HTML strings to the DOM
    elems.tabList.innerHTML += tabsHTML;
    elems.dynamicTabsContentContainer.innerHTML += tabsContentHTML;

    /*
    var x = document.querySelectorAll('webview')[1];
    x.addEventListener("did-get-redirect-request", function (e) {
        setTimeout(function() {
            x.executeJavaScript(`window.location = '${e.newURL}';`);
        }, 10);
        e.preventDefault();
    });
    */

};

/**
 * Add click events to tabs to hide all other tabs and show the content of the
 * selected tab
 */
export const bindTabTriggers = () => {

    // get the tabs and their content at the time of event binding to catch any
    // new tabs that may have been added to the DOM
    const tabs = elems.tabList.querySelectorAll('a');
    const tabContentPanels = elems.tabContentContainer.querySelectorAll('.tab');

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