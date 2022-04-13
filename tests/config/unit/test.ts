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
	 * Returns an instance of the demo page
	 *
	 * @param obj
	 * @param fixture
	 */
	demoPage: ({page, baseURL}, fixture) => fixture(new DemoPage(page, <string>baseURL))
});

export default test;
