/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Locator, Page } from 'playwright';

import { ComponentObject, Scroll } from 'tests/helpers';

import type bVirtualScrollNew from 'components/base/b-virtual-scroll-new/b-virtual-scroll-new';
import type { ComponentRefs, VirtualScrollState } from 'components/base/b-virtual-scroll-new/interface';
import type { SlotsStateObj } from 'components/base/b-virtual-scroll-new/modules/slots';

import { testStyles } from 'components/base/b-virtual-scroll-new/test/api/component-object/styles';

/**
 * The component object API for testing the {@link bVirtualScrollNew} component.
 */
export class VirtualScrollComponentObject extends ComponentObject<bVirtualScrollNew> {
	/**
	 * The locator for the container ref.
	 */
	readonly container: Locator;

	/**
	 * The locator to select all children in the container ref.
	 */
	readonly childList: Locator;

	override get componentStyles(): string {
		return testStyles;
	}

	/**
	 * @param page - the Playwright page instance.
	 */
	constructor(page: Page) {
		super(page, 'b-virtual-scroll-new');

		this.container = this.node.locator(this.elSelector('container'));
		this.childList = this.container.locator('> *');
	}

	/**
	 * Calls the reload method of the component
	 * {@link bVirtualScrollNew.reload}
	 */
	reload(): Promise<void> {
		return this.evaluate((ctx) => ctx.reload());
	}

	/**
	 * Returns the internal component state
	 * {@link bVirtualScrollNew.getVirtualScrollState}
	 */
	getVirtualScrollState(): Promise<VirtualScrollState> {
		return this.evaluate((ctx) => ctx.getVirtualScrollState());
	}

	/**
	 * Returns the count of children in the container ref
	 */
	getChildCount(): Promise<number> {
		return this.childList.count();
	}

	/**
	 * Waits for the container child count to be equal to N.
	 * Throws an error if there are more items in the child list than expected.
	 *
	 * @param count - the expected child count.
	 */
	async waitForChildCountEqualsTo(count: number): Promise<void> {
		await this.childList.nth(count - 1).waitFor({state: 'attached'});

		const realCount = await this.childList.count();

		if (realCount > count) {
			throw new Error(`Expected container to have exactly ${count} items, but got ${realCount}`);
		}
	}

	/**
	 * Returns a promise that resolves when an element matching the given selector is inserted into the container.
	 *
	 * @param selector - the selector to match the element.
	 * @returns A promise that resolves when the element is attached.
	 */
	async waitForChild(selector: string): Promise<void> {
		await this.container.locator(selector).waitFor({state: 'attached'});
	}

	/**
	 * Returns a promise that resolves when an element with the attribute data-index="n" is inserted into the container.
	 *
	 * @param index - the index value for the data-index attribute.
	 * @returns A promise that resolves when the element is attached.
	 */
	async waitForDataIndexChild(index: number): Promise<void> {
		return this.waitForChild(`[data-index="${index}"]`);
	}

	/**
	 * Returns a promise that resolves when the specified event occurs.
	 *
	 * @param eventName - the name of the event to wait for.
	 * @returns A promise that resolves to the payload of the event, or `undefined`.
	 */
	async waitForEvent<PAYLOAD extends unknown>(eventName: string): Promise<CanUndef<PAYLOAD>> {
		return this.evaluate((ctx, [eventName]) => ctx.promisifyOnce(eventName), <const>[eventName]);
	}

	/**
	 * Waits for the component lifecycle to be done
	 */
	async waitForLifecycleDone(): Promise<void> {
		await this.evaluate((ctx) => {
			const state = ctx.getVirtualScrollState();

			if (state.isLifecycleDone) {
				return;
			}

			return ctx.unsafe.componentEmitter.promisifyOnce('lifecycleDone');
		});
	}

	/**
	 * Waits for the provided slot to reach the specified visibility state.
	 *
	 * @param slotName - the name of the slot.
	 * @param isVisible - the expected visibility state.
	 * @param timeout - the timeout for waiting (optional).
	 */
	async waitForSlotState(slotName: keyof ComponentRefs, isVisible: boolean, timeout?: number): Promise<void> {
		const slot = this.node.locator(this.elSelector(slotName.dasherize()));
		await slot.waitFor({state: isVisible ? 'visible' : 'hidden', timeout});
	}

	/**
	 * Returns an object representing the state of all slots.
	 * Each slot is represented as [slotName: slotState], where `slotState=true` means the slot is visible.
	 */
	async getSlotsState(): Promise<Required<SlotsStateObj>> {
		const
			container = this.node.locator(this.elSelector('container')),
			loader = this.node.locator(this.elSelector('loader')),
			tombstones = this.node.locator(this.elSelector('tombstones')),
			empty = this.node.locator(this.elSelector('empty')),
			retry = this.node.locator(this.elSelector('retry')),
			done = this.node.locator(this.elSelector('done')),
			renderNext = this.node.locator(this.elSelector('render-next'));

		return {
			container: await container.isVisible(),
			loader: await loader.isVisible(),
			tombstones: await tombstones.isVisible(),
			empty: await empty.isVisible(),
			retry: await retry.isVisible(),
			done: await done.isVisible(),
			renderNext: await renderNext.isVisible()
		};
	}

	/**
	 * Scrolls the page to the bottom
	 */
	async scrollToBottom(): Promise<this> {
		await Scroll.scrollToBottom(this.pwPage);
		return this;
	}

	/**
	 * Scrolls the page to the top
	 */
	async scrollToTop(): Promise<this> {
		await Scroll.scrollToTop(this.pwPage);
		return this;
	}

	/**
	 * Adds default `itemProps` for pagination
	 */
	withPaginationItemProps(): this {
		this.withProps({
			item: 'section',
			itemProps: (item) => ({'data-index': item.i})
		});

		return this;
	}

	/**
	 * Adds a `requestProp` for pagination.
	 *
	 * @param requestParams - the request parameters.
	 */
	withRequestPaginationProps(requestParams: Dictionary = {}): this {
		this.withProps({
			request: {
				get: {
					chunkSize: 10,
					id: Math.random(),
					...requestParams
				}
			}
		});

		return this;
	}

	/**
	 * Adds a `Provider` into the provider prop for pagination
	 */
	withPaginationProvider(): this {
		this.withProps({dataProvider: 'Provider'});
		return this;
	}

	/**
	 * Calls all default pagination prop setters:
	 * - `withPaginationProvider`
	 * - `withPaginationItemProps`
	 * - `withRequestProp`
	 *
	 * @param requestParams - the request parameters.
	 */
	withDefaultPaginationProviderProps(requestParams: Dictionary = {}): this {
		this.withPaginationProvider();
		this.withPaginationItemProps();
		this.withRequestPaginationProps(requestParams);

		return this;
	}
}
