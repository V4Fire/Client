/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Page } from 'playwright';

import test from 'tests/config/unit/test';
import { BOM, Component } from 'tests/helpers';

import type bDirectivesRefDummy from 'core/component/directives/ref/test/b-directives-ref-dummy/b-directives-ref-dummy';

type RefKey = keyof Pick<bDirectivesRefDummy['$refs'], 'component' | 'slotComponent' | 'nestedSlotComponent'>;

test.describe('core/component/directives/ref', () => {
	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();
		await Component.waitForComponentTemplate(page, 'b-directives-ref-dummy');
	});

	test.describe('the ref should be correctly resolved', () => {
		const stages = [
			'all components are regular',
			'all components are functional',
			'main component is functional and slot components are regular',
			'only one slot component is functional',
			'main component is regular and slot components are functional'
		];

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
