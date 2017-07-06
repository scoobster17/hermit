// module-scope variable to hold DOM elements
let elems;

/**
 * Get all configurations for supported sites from the local plugins folder
 */
export const getPreconfiguredTabs = (DOMElements) => {

    // allow elems to be used in module's other functions
    elems = DOMElements;

    fetch('/pre-configured-tabs')
    .then(res => {
        if (res.ok) return res.json();
        throw new Error('There was an error fetching pre-configured tabs');
    })
    .then(res => addPreconfiguredSiteButtons(res, elems))
    .catch(err => {
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
const addPreconfiguredSiteButtons = (siteConfigs) => {

    let html = '';

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
    elems.preconfiguredTabs.innerHTML = html;

    // once the HTML has been appended to the DOM, find the button elements
    const buttons = elems.preconfiguredTabs.getElementsByTagName('button');

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
            elems.addNewSiteSection.scrollIntoView();
        });
    }
};