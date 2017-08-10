// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
    renderInlineWidgets
} from './embedlib';


// Populate the requirejs cache with local versions of @jupyter-widgets/base,
// @jupyter-widgets/controls, @jupyter-widgets/html-manager. These are externals
// when compiled with webpack.
require('./base');
require('./controls');
require('./index');

/**
 * Load a package using requirejs and return a promise
 *
 * @param pkg Package name or names to load
 */
let requirePromise = function(pkg: string | string[]): Promise<any> {
    return new Promise((resolve, reject) => {
        let require = (window as any).require;
        if (require === undefined) {
            reject("Requirejs is needed, please ensure it is loaded on the page.");
        } else {
            require(pkg, resolve, reject);
        }
    });
}

function requireLoader(moduleName: string, moduleVersion: string) {
    return requirePromise([`${moduleName}.js`]).catch((err) => {
        let failedId = err.requireModules && err.requireModules[0];
        if (failedId) {
            console.log(`Falling back to unpkg.com for ${moduleName}@${moduleVersion}`);
            return requirePromise([`https://unpkg.com/${moduleName}@${moduleVersion}/dist/index.js`]);
        }
    });
}

/**
 * Render widgets in a given element.
 *
 * @param element (default document.documentElement) The element containing widget state and views.
 */
export
function renderWidgets(element = document.documentElement) {
    requirePromise(['@jupyter-widgets/html-manager']).then((htmlmanager) => {
        let managerFactory = () => {
            return new htmlmanager.HTMLManager({loader: requireLoader});
        }
        renderInlineWidgets(managerFactory, element);
    });
}
