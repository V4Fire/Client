/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Locator, Page } from 'playwright';

import { ComponentObject, Scroll } from 'tests/helpers';

import type bScrolly from 'components/base/b-scrolly/b-scrolly';
import type { ComponentRefs, ComponentState } from 'components/base/b-scrolly/b-scrolly';
import type { SlotsStateObj } from 'components/base/b-scrolly/modules/slots';

import { testStyles } from 'components/base/b-scrolly/test/api/component-object/styles';

/**
 * The component object API for testing the {@link bScrolly} component.
 */
export class ScrollyComponentObject extends ComponentObject<bScrolly> {
	/**
	 * The locator for the container ref.
	 */
	readonly container: Locator;

	/**
	 * The locator to select all children in the container ref.
	 */
	readonly childList: Locator;

	/**
	 * @param page - The Playwright page instance.
	 */
	constructor(page: Page) {
		super(page, 'b-scrolly');

		this.container = this.node.locator(this.elSelector('container'));
		this.childList = this.container.locator('> *');
	}

	/**
	 * Overrides the build method to add test styles before building the component.
	 *
	 * @param args - The arguments for the build method.
	 */
	override async build(...args: Parameters<ComponentObject<bScrolly>['build']>): Promise<JSHandle<bScrolly>> {
		await this.page.addStyleTag({content: testStyles});
		return super.build(...args);
	}

	/**
	 * Calls the reload method of the component.
	 */
	reload(): Promise<void> {
		return this.component.evaluate((ctx) => ctx.reload());
	}

	/**
	 * Returns the internal component state.
	 */
	getComponentState(): Promise<ComponentState> {
		return this.component.evaluate((ctx) => ctx.getComponentState());
	}

	/**
	 * Returns the count of children in the container.
	 */
	async getContainerChildCount(): Promise<number> {
		return this.childList.count();
	}

	/**
	 * Waits for the container child count to be equal to N.
	 * Throws an error if there are more items in the child list than expected.
	 *
	 * @param count - The expected child count.
	 */
	async waitForContainerChildCountEqualsTo(count: number): Promise<void> {
		await this.childList.nth(count - 1).waitFor({state: 'attached'});

		const realCount = await this.childList.count();

		if (realCount > count) {
			throw new Error(`Expected container to have exactly ${count} items, but got ${realCount}`);
		}
	}

	/**
	 * Returns a promise that resolves when an element matching the given selector is inserted into the container.
	 *
	 * @param selector - The selector to match the element.
	 * @returns A promise that resolves when the element is attached.
	 */
	async waitForChild(selector: string): Promise<void> {
		await this.container.locator(selector).waitFor({state: 'attached'});
	}

	/**
	 * Returns a promise that resolves when an element with the attribute data-index="n" is inserted into the container.
	 *
	 * @param index - The index value for the data-index attribute.
	 * @returns A promise that resolves when the element is attached.
	 */
	async waitForDataIndexChild(index: number): Promise<void> {
		return this.waitForChild(`[data-index="${index}"]`);
	}

	/**
	 * Returns a promise that resolves when the specified event occurs.
	 *
	 * @param eventName - The name of the event to wait for.
	 * @returns A promise that resolves to the payload of the event, or `undefined`.
	 */
	async waitForEvent<PAYLOAD extends unknown>(eventName: string): Promise<CanUndef<PAYLOAD>> {
		return this.component.evaluate((ctx, [eventName]) => ctx.promisifyOnce(eventName), <const>[eventName]);
	}

	/**
	 * Waits for the component lifecycle to be done.
	 */
	async waitForLifecycleDone(): Promise<void> {
		await this.component.evaluate((ctx) => {
			const state = ctx.getComponentState();

			if (state.isLifecycleDone) {
				return;
			}

			return ctx.componentEmitter.promisifyOnce('lifecycleDone');
		});
	}

	/**
	 * Waits for the provided slot to reach the specified visibility state.
	 *
	 * @param slotName - The name of the slot.
	 * @param isVisible - The expected visibility state.
	 * @param timeout - The timeout for waiting (optional).
	 */
	async waitForSlotState(slotName: keyof ComponentRefs, isVisible: boolean, timeout?: number): Promise<void> {
		const slot = this.node.locator(this.elSelector(slotName));
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
			renderNext = this.node.locator(this.elSelector('renderNext'));

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
	 * Scrolls the page to the bottom.
	 */
	async scrollToBottom(): Promise<this> {
		await Scroll.scrollToBottom(this.page);
		return this;
	}

	/**
	 * Adds default `itemProps` for pagination.
	 */
	async withPaginationItemProps(): Promise<this> {
		await this.setProps({
			item: 'section',
			itemProps: (item) => ({'data-index': item.i})
		});

		return this;
	}

	/**
	 * Adds a `requestProp` for pagination.
	 *
	 * @param requestParams - The request parameters.
	 */
	async withRequestPaginationProps(requestParams: Dictionary = {}): Promise<this> {
		await this.setProps({
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
	 * Adds a `Provider` into the provider prop for pagination.
	 */
	async withPaginationProvider(): Promise<this> {
		await this.setProps({dataProvider: 'Provider'});
		return this;
	}

	/**
	 * Calls all default pagination prop setters:
	 * - `withPaginationProvider`
	 * - `withPaginationItemProps`
	 * - `withRequestProp`
	 *
	 * @param requestParams - The request parameters.
	 */
	async withDefaultPaginationProviderProps(requestParams: Dictionary = {}): Promise<this> {
		await this.withPaginationProvider();
		await this.withPaginationItemProps();
		await this.withRequestPaginationProps(requestParams);

		return this;
	}
}
