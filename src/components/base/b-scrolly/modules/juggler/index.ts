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
import { canPerformRenderRejectionReason, componentDataLocalEvents, componentLocalEvents, componentObserverLocalEvents, componentRenderLocalEvents } from 'components/base/b-scrolly/const';
import type { MountedComponentItem } from 'components/base/b-scrolly/interface';

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
			{typedLocalEmitter} = ctx;

		typedLocalEmitter.on(componentObserverLocalEvents.elementEnter, (component) => this.onElementEnters(component));
		typedLocalEmitter.on(componentObserverLocalEvents.elementOut, (component) => this.onElementOut(component));
		typedLocalEmitter.on(componentLocalEvents.resetState, () => this.reset());
		typedLocalEmitter.on(componentRenderLocalEvents.renderDone, () => this.checkIsDone());

		typedLocalEmitter.on(componentDataLocalEvents.dataLoadSuccess, () => {
			this.onDataLoaded();
			this.checkIsDone();
		});

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

		ctx.typedLocalEmitter.emit(componentRenderLocalEvents.renderStart);

		const
			items = ctx.componentFactory.produceComponentItems(dataSlice),
			nodes = ctx.componentFactory.produceNodes(items),
			mountedItems = this.mountedComponentItems(items, nodes);

		ctx.componentInternalState.updateMountedComponents(mountedItems);
		ctx.observer.observe(mountedItems);

		ctx.typedLocalEmitter.emit(componentRenderLocalEvents.domInsertStart);

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

			ctx.typedLocalEmitter.emit(componentRenderLocalEvents.domInsertDone);
			ctx.typedLocalEmitter.emit(componentRenderLocalEvents.renderDone);

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
	protected mountedComponentItems(items: ComponentItem[], nodes: HTMLElement[]): MountedComponentItem[] {
		const
			{ctx} = this,
			{mountedItems} = ctx.getComponentState();

		return items.map((item, i) => ({
			...item,
			node: nodes[i],
			index: mountedItems.length + i
		}));
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
	 * Checks if all data are rendered and all requests are made
	 */
	protected checkIsDone(): void {
		const
			{ctx} = this,
			{isDone} = ctx.getComponentState(),
			slice = this.getNextDataSlice();

		if (
			slice.length === 0 &&
			ctx.shouldStopRequestingDataWrapper() &&
			!isDone
		) {
			ctx.typedLocalEmitter.emit(componentLocalEvents.done);
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
	protected onElementEnters(component: MountedComponentItem): void {
		const
			{ctx} = this,
			state = ctx.getComponentState(),
			{index} = component;

		if (state.maxViewedIndex == null || state.maxViewedIndex < index) {
			ctx.componentInternalState.setMaxViewedIndex(index);
		}

		this.loadDataOrPerformRender();
	}

	/**
	 * Handler: element leaves the viewport
	 */
	protected onElementOut(_component: MountedComponentItem): void {
		// ...
	}
}
