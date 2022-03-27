/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { test as base } from '@playwright/test';

import DemoPage from 'pages/p-v4-components-demo/test/api/page';

export interface Fixtures {
	demoPage: DemoPage;
}

const test = base.extend<Fixtures>({
	/**
	 * Navigates to the demo page and returns an instance of the page
	 * @param obj
	 */
	demoPage: async ({page, baseURL}, use) => use(new DemoPage(page, <string>baseURL))
});

export default test;
