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
import type { CanPerformRenderRejectionReason } from 'components/base/b-scrolly/b-scrolly';
import { canPerformRenderRejectionReason, componentDataLocalEvents, componentLocalEvents, componentObserverLocalEvents, componentRenderLocalEvents } from 'components/base/b-scrolly/const';

export const
	$$ = symbolGenerator(),
	mediatorAsyncGroup = 'mediator';

/**
 * Friendly to the `bScrolly` class.
 * Provides an API for composing and managing `bScrolly` modules
 */
export class Mediator extends Friend {

	/**
	 * {@link bScrolly}
	 */
	override readonly C!: bScrolly;

	/**
	 * `True` if the next rendering process will be initial
	 */
	protected isInitialRender: boolean = true;

	/**
	 * @param ctx
	 */
	constructor(ctx: bScrolly) {
		super(ctx);

		const
			{typedLocalEmitter} = ctx;

		typedLocalEmitter.on(componentDataLocalEvents.dataLoadSuccess, () => this.onDataLoaded());
		typedLocalEmitter.on(componentObserverLocalEvents.elementEnter, () => this.onElementEnters());
		typedLocalEmitter.on(componentObserverLocalEvents.elementOut, () => this.onElementOut());
		typedLocalEmitter.on(componentLocalEvents.resetState, () => this.reset());
	}

	/**
	 * Resets the module state
	 */
	protected reset(): void {
		const
			{ctx} = this;

		this.isInitialRender = true;

		ctx.async.clearAll({group: new RegExp(mediatorAsyncGroup)});
	}

	/**
	 * Returns status of the possibility to render a components.
	 * Also returns reason of the rejection if the is no possibility to render components
	 */
	protected canPerformRender(): {result: boolean; reason?: CanPerformRenderRejectionReason} {
		if (this.isInitialRender) {
			return {
				result: true
			};
		}

		const
			{ctx} = this,
			{chunkSize} = ctx,
			dataSlice = this.getNextDataSlice();

		if (dataSlice.length < chunkSize) {
			return {
				result: false,
				reason: canPerformRenderRejectionReason.notEnoughData
			};
		}

		return {
			result: true
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
			nodes = ctx.componentFactory.produceComponents(dataSlice);

		if (nodes.length === 0) {
			return;
		}

		ctx.typedLocalEmitter.emit(componentRenderLocalEvents.domInsertStart);

		const
			fragment = document.createDocumentFragment();

		for (let i = 0; i < nodes.length; i++) {
			this.dom.appendChild(fragment, nodes[i], {
				group: mediatorAsyncGroup,
				destroyIfComponent: true
			});
		}

		ctx.async.requestAnimationFrame(() => {
			refs.container.appendChild(fragment);

			ctx.typedLocalEmitter.emit(componentRenderLocalEvents.domInsertDone);
			ctx.typedLocalEmitter.emit(componentRenderLocalEvents.renderDone);

		}, {label: $$.insertDomRaf, group: mediatorAsyncGroup});
	}

	/**
	 * Returns a data slice that should be rendered next
	 */
	protected getNextDataSlice(): object[] {
		const
			{ctx} = this,
			{chunkSize} = ctx,
			{data, renderPage} = ctx.getComponentState();

		return data.slice(renderPage * chunkSize, (renderPage + 1) * chunkSize);
	}

	/**
	 * Handler: element enters the viewport
	 */
	protected onElementEnters(): void {
		// ...
	}

	/**
	 * Handler: element leaves the viewport
	 */
	protected onElementOut(): void {
		// ...
	}

	/**
	 * Handler: data was loaded
	 */
	protected onDataLoaded(): void {
		const
			{ctx} = this,
			{result, reason} = this.canPerformRender();

		if (result) {
			return this.performRender();
		}

		if (reason === canPerformRenderRejectionReason.notEnoughData) {
			void ctx.initLoad();
		}
	}
}
