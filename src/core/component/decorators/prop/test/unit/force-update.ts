/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';

import { Component } from 'tests/helpers';
import type bEffectPropWrapperDummy from 'core/component/decorators/prop/test/b-effect-prop-wrapper-dummy/b-effect-prop-wrapper-dummy';

test.describe('contracts for props effects', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test.describe('changing the value of the prop with `forceUpdate: false`', () => {
		test(
			'for a non-functional component, it should not cause the re-rendering of its template',

			async ({page}) => {
				const target = await Component.createComponent<bEffectPropWrapperDummy>(page, 'b-effect-prop-wrapper-dummy', {
					stage: 'without effect'
				});

				const text = await page.getByText('Content');
				await test.expect(text).toHaveText('Content: foo');
				await target.evaluate((ctx) => ctx.someField = 'bar');
				await test.expect(text).toHaveText('Content: foo');
			}
		);
	});

	test.describe('changing the value of the prop without `forceUpdate: false`', () => {
		test(
			'for a non-functional component, it should cause the re-rendering of its template',

			async ({page}) => {
				const target = await Component.createComponent<bEffectPropWrapperDummy>(page, 'b-effect-prop-wrapper-dummy', {
					stage: 'with effect'
				});

				const text = await page.getByText('Content');
				await test.expect(text).toHaveText('Content: foo');
				await target.evaluate((ctx) => ctx.someField = 'bar');
				await test.expect(text).toHaveText('Content: bar');
			}
		);
	});
});
