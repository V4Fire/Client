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
import type { ComponentItem } from 'components/base/b-scrolly/b-scrolly';
import { canPerformRenderRejectionReason, componentDataLocalEvents, componentItemType, componentLocalEvents, componentObserverLocalEvents, componentRenderLocalEvents } from 'components/base/b-scrolly/const';
import type { AnyMounted, MountedItem } from 'components/base/b-scrolly/interface';
import { isItem } from 'components/base/b-scrolly/modules/helpers';

export const
	$$ = symbolGenerator(),
	jugglerAsyncGroup = '[[JUGGLER]]';

/**
 * A class that is friendly to `bScrolly`.
 * Provides an API for initializing various component modules and inserting components into the DOM tree.
 */
export class Juggler extends Friend {

	/**
	 * {@link bScrolly}
	 */
	override readonly C!: bScrolly;

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
	 * Resets the module's state to its initial state.
	 */
	protected reset(): void {
		const
			{ctx} = this;

		ctx.async.clearAll({group: new RegExp(jugglerAsyncGroup)});
	}

	/**
	 * Renders components using `componentFactory` and inserts them into the DOM tree.
	 * `componentFactory`, in turn, calls `itemsFactory` to obtain the set of components to render.
	 */
	protected performRender(): void {
		const
			{ctx, refs} = this;

		ctx.componentEmitter.emit(componentRenderLocalEvents.renderStart);

		const
			items = ctx.componentFactory.produceComponentItems(),
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
	 * Augments `ComponentItem` with various properties such as the component node, item index, and child index.
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
	 * A function that performs actions (data loading/rendering) depending on the result of the `renderGuard` method.
	 *
	 * This function is the "starting point" for rendering components and is called after successful data loading
	 * or when rendered items enter the viewport.
	 */
	protected loadDataOrPerformRender(): void {
		const
			{ctx} = this,
			state = ctx.getComponentState(),
			{result, reason} = ctx.renderGuard(state, ctx);

		if (result) {
			return this.performRender();
		}

		if (reason === canPerformRenderRejectionReason.done) {
			ctx.componentInternalState.setIsLifecycleDone(true);
			return;
		}

		if (reason === canPerformRenderRejectionReason.noData) {
			if (state.isRequestsStopped) {
				return;
			}

			if (ctx.shouldPerformDataRequestWrapper()) {
				void ctx.initLoad();
			}
		}

		if (reason === canPerformRenderRejectionReason.notEnoughData) {
			if (state.isRequestsStopped) {
				this.performRender();

			} else if (ctx.shouldPerformDataRequestWrapper()) {
				void ctx.initLoad();

			} else if (state.isInitialRender) {
				this.performRender();
			}
		}
	}

	/**
	 * Handler: successful data loading.
	 */
	protected onDataLoaded(): void {
		this.loadDataOrPerformRender();
	}

	/**
	 * Handler: component enters the viewport.
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
	 * Handler: component leaves the viewport.
	 */
	protected onElementOut(_component: AnyMounted): void {
		// ...
	}
}
