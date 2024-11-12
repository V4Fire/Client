/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { toQueryString } from 'core/url';
import type { JSHandle, Page } from 'playwright';

import test from 'tests/config/unit/test';
import { BOM, Component } from 'tests/helpers';

import bDirectivesRefDummy from 'core/component/directives/ref/test/b-directives-ref-dummy/b-directives-ref-dummy';

type RefKey = keyof Pick<bDirectivesRefDummy['$refs'], 'component' | 'slotComponent' | 'nestedSlotComponent'>;

test.describe('core/component/directives/ref', () => {
	const stages = [
		'all components are regular',
		'all components are functional',
		'main component is functional and slot components are regular',
		'only one slot component is functional',
		'main component is regular and slot components are functional'
	];

	test.describe('the ref should be correctly resolved on the root page', () => {
		test.describe('during regular render', () => {
			stages.forEach((stage) => {
				test(`when ${stage}`, async ({demoPage, page}) => {
					await demoPage.goto(toQueryString({stage: `refs:${stage}`}));
					const target = await Component.getComponentByQuery<bDirectivesRefDummy>(page, '.b-directives-ref-dummy');

					await assertRefsAreCorrect(target!);
				});
			});
		});

		test.describe('during async render', () => {
			stages.forEach((stage) => {
				test(`when ${stage}`, async ({demoPage, page}) => {
					await demoPage.goto(toQueryString({stage: `refs-async:${stage}`}));
					const target = await Component.getComponentByQuery<bDirectivesRefDummy>(page, '.b-directives-ref-dummy');

					await BOM.waitForIdleCallback(page);

					await assertRefsAreCorrect(target!);
				});
			});
		});
	});

	test.describe('the ref should be correctly resolved', () => {
		test.beforeEach(async ({demoPage}) => {
			await demoPage.goto();
		});

		test.describe('during regular render', () => {
			stages.forEach((stage) => {
				test(`when ${stage}`, async ({page}) => {
					const target = await createComponent(page, stage);

					await assertRefsAreCorrect(target);
				});
			});
		});

		test.describe('during async render', () => {
			stages.forEach((stage) => {
				test(`when ${stage}`, async ({page}) => {
					const target = await createComponent(page, stage, true);

					await BOM.waitForIdleCallback(page);

					await assertRefsAreCorrect(target);
				});
			});
		});
	});

	function createComponent(
		page: Page, stage: string, useAsyncRender: boolean = false
	): Promise<JSHandle<bDirectivesRefDummy>> {
		return Component.createComponent(page, 'b-directives-ref-dummy', {stage, useAsyncRender});
	}

	async function assertRefsAreCorrect(target: JSHandle<bDirectivesRefDummy>) {
		const refs = await target.evaluate((ctx) => {
			return [
				getRefId('component'),
				getRefId('slotComponent'),
				getRefId('nestedSlotComponent')
			];

			function getRefId(refName: RefKey): CanUndef<string> {
				const
					refVal = ctx.unsafe.$refs[refName],
					ref = Array.isArray(refVal) ? refVal[0] : refVal;

				return ref?.$el?.id;
			}
		});

		test.expect(refs).toEqual(['main', 'slot', 'nested']);
	}
});
