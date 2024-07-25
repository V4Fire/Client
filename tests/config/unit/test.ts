/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import base from 'tests/config/super/test';

import DemoPage from 'components/pages/p-v4-components-demo/test/api/page';
import SyncTestPage from 'components/pages/p-v4-sync-test-page/test/api/page';
import ConsoleTracker from 'tests/fixtures/console-tracker';

export interface Fixtures {
	demoPage: DemoPage;
	syncTestPage: SyncTestPage;
	consoleTracker: ConsoleTracker;
}

const test = base.extend<Fixtures>({
	/**
	 * Returns an instance of the demo page
	 *
	 * @param opts
	 * @param opts.page
	 * @param opts.baseURL
	 * @param fixture
	 */
	demoPage: ({page, baseURL}, fixture) => fixture(new DemoPage(page, <string>baseURL)),

	/**
	 * Returns an instance of the sync test page
	 *
	 * @param opts
	 * @param opts.page
	 * @param opts.baseURL
	 * @param fixture
	 */
	syncTestPage: ({page, baseURL}, fixture) => fixture(new SyncTestPage(page, <string>baseURL)),

	/**
	 * Returns an instance of the ConsolerTracker
	 *
	 * @param opts
	 * @param opts.page
	 * @param opts.baseURL
	 * @param fixture
	 */
	consoleTracker: async ({page}, fixture) => {
		const tracker = new ConsoleTracker(page);

		await fixture(tracker);

		tracker.clear();
	}
});

export default test;
