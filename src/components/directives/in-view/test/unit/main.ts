/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';

import {

	createDivForInViewTest,
	getWatcherCallsCount,
	initViewport,
	makeEnterViewport,
	restoreViewport

} from 'components/directives/in-view/test/helpers';

test.describe('<div> v-in-view', () => {

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();
		await initViewport(page);
	});

	test('handler should be called when element enters viewport', async ({page}) => {
		const divLocator = await createDivForInViewTest(page, undefined);
		await makeEnterViewport(divLocator);
		test.expect(await getWatcherCallsCount(divLocator)).toBe(1);
	});

	test('handler should be called only once if `once` is set', async ({page}) => {
		const divLocator = await createDivForInViewTest(page, {
			once: true
		});
		await makeEnterViewport(divLocator);
		await restoreViewport(page);
		await makeEnterViewport(divLocator);
		test.expect(await getWatcherCallsCount(divLocator)).toBe(1);
	});

	test('all handlers should be called', async ({page}) => {
		const divLocator = await createDivForInViewTest(page, [{once: true}, {once: true}]);
		await makeEnterViewport(divLocator);
		test.expect(await getWatcherCallsCount(divLocator)).toBe(2);
	});

});
