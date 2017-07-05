const tabContentContainer = document.getElementById('tab-content-container');
const dynamicTabsContentContainer = document.getElementById('dynamic-tabs-content-container');
var preconfiguredTabs = document.getElementById('pre-configured-tabs');

const getPreconfiguredTabs = () => {
    fetch('/pre-configured-tabs')
    .then(res => {
        if (res.ok) return res;
        throw new Error('There was an error');
    })
    .then(res => res.json())
    .then(res => {
        let html = '';
        res.forEach((siteConfig) => {
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
        preconfiguredTabs.innerHTML = html;
        var addNewSiteSection = document.getElementById('add-new-site');
        var buttons = preconfiguredTabs.getElementsByTagName('button');
        for (let button of buttons) {
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
        if (tabs) {
            tabs.forEach((tab) => {
                tab.showTab = false;
            });
            createTabs(tabs);
            bindTabTriggers();
        };
    });
};

const createTabs = (tabs) => {
    let tabsHTML = '';
    let tabsContentHTML = '';

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

    tabList.innerHTML += tabsHTML;
    dynamicTabsContentContainer.innerHTML += tabsContentHTML;

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

        createTabs([{ ...tabDetails, showTab: true }]);
        bindTabTriggers();
        return false;
    });
}
window.addEventListener('load', init);
