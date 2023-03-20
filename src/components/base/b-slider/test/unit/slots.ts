/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';

import { renderSlider } from 'components/base/b-slider/test/helpers';

test.describe('b-slider: slots rendering', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('renders `default` slot: the slot for slides', async ({page}) => {
		const
			id = 'foo';

		const slider = await renderSlider(page, {
			children: {
				default: {
					type: 'div',
					attrs: {id},
					children: {
						default: () => 'content'
					}
				}
			}
		});

		const node = await slider.evaluate((ctx, id) => {
			const node = <Nullable<HTMLDivElement>>ctx.content?.querySelector(`#${id}`);

			return {
				tagName: node?.tagName,
				id: node?.id,
				textContent: node?.textContent
			};
		}, id);

		test.expect(node.textContent).toBe('content');
		test.expect(node.tagName).toBe('DIV');
		test.expect(node.id).toBe(id);
	});

	test('renders `beforeItems` slot: the slot for content before the first slide', async ({page}) => {
		const
			slotId = 'slot',
			slideId = 'slide';

		const slider = await renderSlider(page, {
			attrs: {
				items: [{id: slideId}],
				item: 'b-checkbox',
				itemProps: ({id}) => ({id})
			},

			children: {
				beforeItems: {
					type: 'div',
					attrs: {id: slotId}
				}
			}
		});

		const firstItemId = await slider.evaluate((ctx, slotId) => {
			const
				slotNode = <Nullable<HTMLDivElement>>ctx.content?.querySelector(`#${slotId}`),
				blockHelper = slotNode?.nextElementSibling;

			return blockHelper?.firstElementChild?.id;
		}, slotId);

		test.expect(firstItemId).toBe(slideId);
	});

	test('renders `afterItems` slot: the slot for content after the last slide', async ({page}) => {
		const
			slotId = 'slot',
			slideId = 'slide';

		const slider = await renderSlider(page, {
			attrs: {
				items: [{id: slideId}],
				item: 'b-checkbox',
				itemProps: ({id}) => ({id})
			},

			children: {
				afterItems: {
					type: 'div',
					attrs: {id: slotId}
				}
			}
		});

		const firstItemId = await slider.evaluate((ctx, slotId) => {
			const
				slotNode = <Nullable<HTMLDivElement>>ctx.content?.querySelector(`#${slotId}`),
				blockHelper = slotNode?.previousElementSibling;

			return blockHelper?.firstElementChild?.id;
		}, slotId);

		test.expect(firstItemId).toBe(slideId);
	});

	test('renders `before` slot: the slot for content before the slider window (area with slides)', async ({page}) => {
		const
			slotId = 'slot';

		const slider = await renderSlider(page, {
			children: {
				before: {
					type: 'div',
					attrs: {id: slotId}
				}
			}
		});

		const {nextToSlotNode, sliderWindowNode} = await slider.evaluate((ctx, slotId) => {
			const
				slotNode = <Nullable<HTMLDivElement>>ctx.$el?.querySelector(`#${slotId}`);

			return {
				nextToSlotNode: slotNode?.nextElementSibling,
				sliderWindowNode: ctx.$el?.querySelector('.b-slider__window')
			};
		}, slotId);

		test.expect(nextToSlotNode).toEqual(sliderWindowNode);
	});

	test('renders `after` slot: the slot for content after the slider window (area with slides)', async ({page}) => {
		const
			slotId = 'slot';

		const slider = await renderSlider(page, {
			children: {
				after: {
					type: 'div',
					attrs: {id: slotId}
				}
			}
		});

		const {prevToSlotNode, sliderWindowNode} = await slider.evaluate((ctx, slotId) => {
			const
				slotNode = <Nullable<HTMLDivElement>>ctx.$el?.querySelector(`#${slotId}`);

			return {
				prevToSlotNode: slotNode?.previousElementSibling,
				sliderWindowNode: ctx.$el?.querySelector('.b-slider__window')
			};
		}, slotId);

		test.expect(prevToSlotNode).toEqual(sliderWindowNode);
	});
});
