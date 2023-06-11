/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';

import Friend from 'components/friends/friend';

import type bScrolly from 'components/base/b-scrolly/b-scrolly';
import type { CanPerformRenderRejectionReason, ComponentItem } from 'components/base/b-scrolly/b-scrolly';
import { canPerformRenderRejectionReason, componentDataLocalEvents, componentItemType, componentLocalEvents, componentObserverLocalEvents, componentRenderLocalEvents } from 'components/base/b-scrolly/const';
import type { AnyMounted, MountedItem } from 'components/base/b-scrolly/interface';
import { isItem } from 'components/base/b-scrolly/modules/helpers';

export const
	$$ = symbolGenerator(),
	jugglerAsyncGroup = '[[JUGGLER]]';

/**
 * Friendly to the `bScrolly` class.
 * Provides an API for managing DOM insertion of the components
 */
export class Juggler extends Friend {

	/**
	 * {@link bScrolly}
	 */
	override readonly C!: bScrolly;

	protected get nextDataSliceStartIndex(): number {
		const
			{ctx, ctx: {chunkSize}} = this,
			{renderPage} = ctx.getComponentState();

		return renderPage * chunkSize;
	}

	protected get nextDataSliceEndIndex(): number {
		const
			{ctx, ctx: {chunkSize}} = this,
			{renderPage} = ctx.getComponentState();

		return (renderPage + 1) * chunkSize;
	}

	/**
	 * @param ctx
	 */
	constructor(ctx: bScrolly) {
		super(ctx);

		const
			{componentEmitter} = ctx;

		componentEmitter.on(componentObserverLocalEvents.elementEnter, (component) => this.onElementEnters(component));
		componentEmitter.on(componentObserverLocalEvents.elementOut, (component) => this.onElementOut(component));
		componentEmitter.on(componentLocalEvents.resetState, () => this.reset());
		componentEmitter.on(componentDataLocalEvents.dataLoadSuccess, () => this.onDataLoaded());
	}

	/**
	 * Resets the module state
	 */
	protected reset(): void {
		const
			{ctx} = this;

		ctx.async.clearAll({group: new RegExp(jugglerAsyncGroup)});
	}

	/**
	 * Returns status of the possibility to render a components.
	 * Also returns reason of the rejection if the is no possibility to render components
	 */
	protected canPerformRender(): {result: boolean; reason?: CanPerformRenderRejectionReason} {
		const
			{ctx} = this,
			{chunkSize} = ctx,
			state = this.ctx.getComponentState(),
			dataSlice = this.getNextDataSlice();

		if (dataSlice.length === 0) {
			return {
				result: false,
				reason: canPerformRenderRejectionReason.noData
			};
		}

		if (dataSlice.length < chunkSize) {
			return {
				result: false,
				reason: canPerformRenderRejectionReason.notEnoughData
			};
		}

		if (state.isInitialRender) {
			return {
				result: true
			};
		}

		const
			clientResponse = ctx.shouldPerformDataRenderWrapper();

		return {
			result: clientResponse,
			reason: clientResponse === false ? canPerformRenderRejectionReason.clientRejection : undefined
		};
	}

	/**
	 * Renders the next chunk of the elements
	 */
	protected performRender(): void {
		const
			{ctx, refs} = this,
			dataSlice = this.getNextDataSlice();

		ctx.componentEmitter.emit(componentRenderLocalEvents.renderStart);

		const
			items = ctx.componentFactory.produceComponentItems(dataSlice),
			nodes = ctx.componentFactory.produceNodes(items),
			anyMounted = this.produceMounted(items, nodes),
			mountedItems = <MountedItem[]>anyMounted.filter((mounted) => mounted.type === componentItemType.item);

		ctx.componentInternalState.updateMountedItems(mountedItems);
		ctx.componentInternalState.updateChildList(anyMounted);
		ctx.observer.observe(anyMounted);

		ctx.componentEmitter.emit(componentRenderLocalEvents.domInsertStart);

		const
			fragment = document.createDocumentFragment();

		for (let i = 0; i < nodes.length; i++) {
			this.dom.appendChild(fragment, nodes[i], {
				group: jugglerAsyncGroup,
				destroyIfComponent: true
			});
		}

		ctx.async.requestAnimationFrame(() => {
			refs.container.appendChild(fragment);

			ctx.componentEmitter.emit(componentRenderLocalEvents.domInsertDone);
			ctx.componentEmitter.emit(componentRenderLocalEvents.renderDone);

		}, {label: $$.insertDomRaf, group: jugglerAsyncGroup});
	}

	/**
	 * Returns a data slice that should be rendered next
	 */
	protected getNextDataSlice(): object[] {
		const
			{ctx} = this,
			{data} = ctx.getComponentState();

		return data.slice(this.nextDataSliceStartIndex, this.nextDataSliceEndIndex);
	}

	/**
	 * Stores the component items
	 *
	 * @param items
	 * @param nodes
	 */
	protected produceMounted(items: ComponentItem[], nodes: HTMLElement[]): Array<AnyMounted | AnyMounted> {
		const
			{ctx} = this,
			{items: mountedItems, childList} = ctx.getComponentState();

		return items.map((item, i) => {
			if (item.type === componentItemType.item) {
				return {
					...item,
					node: nodes[i],
					itemIndex: mountedItems.length + i,
					childIndex: childList.length + i
				};
			}

			return {
				...item,
				node: nodes[i],
				childIndex: mountedItems.length + i
			};
		});
	}

	/**
	 * Performs render if it is possible
	 */
	protected loadDataOrPerformRender(): void {
		const
			{ctx} = this,
			state = ctx.getComponentState(),
			{result, reason} = this.canPerformRender();

		if (result) {
			return this.performRender();
		}

		if (reason === canPerformRenderRejectionReason.noData) {
			if (ctx.shouldStopRequestingDataWrapper()) {
				return;
			}

			if (ctx.shouldPerformDataRequestWrapper()) {
				void ctx.initLoad();
			}
		}

		if (reason === canPerformRenderRejectionReason.notEnoughData) {
			if (ctx.shouldStopRequestingDataWrapper()) {
				this.performRender();

			} else if (ctx.shouldPerformDataRequestWrapper()) {
				void ctx.initLoad();

			} else if (state.isInitialRender) {
				this.performRender();
			}
		}

		if (reason === canPerformRenderRejectionReason.clientRejection) {
			// ...
		}
	}

	/**
	 * Handler: data was loaded
	 */
	protected onDataLoaded(): void {
		this.loadDataOrPerformRender();
	}

	/**
	 * Handler: element enters the viewport
	 */
	protected onElementEnters(component: AnyMounted): void {
		const
			{ctx} = this,
			state = ctx.getComponentState(),
			{childIndex} = component;

		if (isItem(component) && (state.maxViewedItem == null || state.maxViewedItem < component.itemIndex)) {
			ctx.componentInternalState.setMaxViewedItemIndex(component.itemIndex);
		}

		if (state.maxViewedChild == null || state.maxViewedChild < childIndex) {
			ctx.componentInternalState.setMaxViewedChildIndex(childIndex);
		}

		this.loadDataOrPerformRender();
	}

	/**
	 * Handler: element leaves the viewport
	 */
	protected onElementOut(_component: AnyMounted): void {
		// ...
	}
}
