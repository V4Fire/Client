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

export class ScrollyComponentObject extends ComponentObject<bScrolly> {

	/**
	 * Container ref
	 */
	readonly container: Locator;

	/**
	 * @param page
	 */
	constructor(page: Page) {
		super(page, 'b-scrolly');
		this.container = this.node.locator(this.elSelector('container'));
	}

	override async build(...args: Parameters<ComponentObject<bScrolly>['build']>): Promise<JSHandle<bScrolly>> {
		await this.page.addStyleTag({content: `
			[data-index] {
				width: 200px;
				height: 200px;
				margin: 16px;
				background-color: red;
			}

			[data-index]:after {
				content: attr(data-index);
			}

			#done {
				width: 200px;
				height: 200px;
				display: flex;
				justify-content: center;
				align-items: center;
				background-color: green;
			}

			#done:after {
				content: "done";
			}
		`});

		return super.build(...args);
	}

	/**
	 * Calls a reload method of the component
	 */
	reload(): Promise<void> {
		return this.component.evaluate((ctx) => ctx.reload());
	}

	/**
	 * Returns an internal component state
	 */
	getComponentState(): Promise<ComponentState> {
		return this.component.evaluate((ctx) => ctx.getComponentState());
	}

	/**
	 * Returns a container child count
	 */
	async getContainerChildCount(): Promise<number> {
		return this.container.locator('*').count();
	}

	/**
	 * Waits for container child count equals to N
	 */
	async waitForContainerChildCountEqualsTo(n: number): Promise<void> {
		await this.container.locator('*').nth(n - 1).waitFor({state: 'attached'});
	}

	/**
	 * Returns a promise that will be resolved after the component emits `domInsertDone`
	 */
	async waitForDomInsertDoneEvent(): Promise<this> {
		await this.component.evaluate((ctx) => ctx.componentEmitter.promisifyOnce('domInsertDone'));
		return this;
	}

	async waitForLifecycleDone(): Promise<void> {
		await this.component.evaluate((ctx) => {
			const
				state = ctx.getComponentState();

			if (state.isLifecycleDone) {
				return;
			}

			return ctx.componentEmitter.promisifyOnce('lifecycleDone');
		});
	}

	/**
	 * Returns promise that will be resolved then the provided slot will hit `isVisible` state
	 *
	 * @param slotName
	 * @param isVisible
	 */
	async waitForSlotState(slotName: keyof ComponentRefs, isVisible: boolean): Promise<void> {
		const
			root = await this.node.elementHandle();

		await root?.waitForSelector(this.elSelector(slotName), {state: isVisible ? 'visible' : 'hidden'});
	}

	async getSlotsState(): Promise<Required<SlotsStateObj>> {
		const
			root = await this.node.elementHandle();

		const
			container = await root?.$(this.elSelector('container')),
			loader = await root?.$(this.elSelector('loader')),
			tombstones = await root?.$(this.elSelector('tombstones')),
			empty = await root?.$(this.elSelector('empty')),
			retry = await root?.$(this.elSelector('retry')),
			done = await root?.$(this.elSelector('done')),
			renderNext = await root?.$(this.elSelector('renderNext'));

		return {
			container: Boolean(await container?.isVisible()),
			loader: Boolean(await loader?.isVisible()),
			tombstones: Boolean(await tombstones?.isVisible()),
			empty: Boolean(await empty?.isVisible()),
			retry: Boolean(await retry?.isVisible()),
			done: Boolean(await done?.isVisible()),
			renderNext: Boolean(await renderNext?.isVisible())
		};
	}

	/**
	 * Scrolls page to the bottom
	 */
	async scrollToBottom(): Promise<this> {
		await Scroll.scrollToBottom(this.page);
		return this;
	}

	/**
	 * Adds default `iItems` props
	 */
	withPaginationItemProps(): this {
		this.setProps({
			item: 'section',
			itemProps: (item) => ({'data-index': item.i})
		});

		return this;
	}

	/**
	 * Adds a `requestProp`
	 * @param requestParams
	 */
	withRequestProp(requestParams: Dictionary = {}): this {
		this.setProps({
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
	 * Adds a `Provider` into provider prop
	 */
	withPaginationProvider(): this {
		this.setProps({dataProvider: 'Provider'});
		return this;
	}

	/**
	 * Calls every `pagination-like` default props setters:
	 *
	 * - `withPaginationProvider`
	 * - `withPaginationItemProps`
	 * - `withRequestProp`
	 *
	 * @param requestParams
	 */
	withDefaultPaginationProviderProps(requestParams: Dictionary = {}): this {
		return this
			.withPaginationProvider()
			.withPaginationItemProps()
			.withRequestProp(requestParams);
	}
}
