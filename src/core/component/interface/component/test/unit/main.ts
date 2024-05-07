/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Page } from 'playwright';

import test from 'tests/config/unit/test';

import { Component } from 'tests/helpers';

import type bComponentInterfaceDummy from 'core/component/interface/component/test/b-component-interface-dummy/b-component-interface-dummy';
import { evalTree, treeToString, trim } from 'core/component/interface/component/test/helpers';

test.describe('core/component/interface', () => {
	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();
		await Component.waitForComponentTemplate(page, 'b-component-interface-dummy');
	});

	test.describe('$parent', () => {
		test('components nested within slots should correctly identify their parent', async ({page}) => {
			await createComponent(page, 'parent in nested slots');

			const tree = await page.evaluate(evalTree);

			test.expect(treeToString(tree)).toEqual(trim`
				p-v4-components-demo
					b-component-interface-dummy
						b-dummy:1
							b-dummy:2
								b-dummy:3
			`);
		});

		test('functional components should correctly identify their parent', async ({page}) => {
			await createComponent(page, 'functional components');

			const tree = await page.evaluate(evalTree);

			test.expect(treeToString(tree)).toEqual(trim`
				p-v4-components-demo
					b-component-interface-dummy
						b-dummy
							b-list <func>
								b-button
								b-button
			`);
		});

		function createComponent(page: Page, stage: string = '') {
			return Component.createComponent<bComponentInterfaceDummy>(page, 'b-component-interface-dummy', {stage});
		}
	});
});
