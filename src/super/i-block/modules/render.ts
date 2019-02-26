/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Async from 'core/async';
import iBlock from 'super/i-block/i-block';
import { patchVNode, execRenderObject, RenderObject, RenderContext, VNode } from 'core/component';
import { queue, backQueue, restart, deferRestart } from 'core/render';

export interface AsyncTaskObjectId {
	id: AsyncTaskSimpleId;
	weight?: number;
	filter?(id: AsyncTaskSimpleId): boolean;
}

export type AsyncTaskSimpleId = string | number;
export type AsyncTaskId = AsyncTaskSimpleId | (() => AsyncTaskObjectId) | AsyncTaskObjectId;
export type AsyncQueueType = 'asyncComponents' | 'asyncBackComponents';

export default class Render {
	/**
	 * Component render weight
	 */
	get weight(): CanUndef<number> {
		return this.component.weight;
	}

	/**
	 * True if the current component is functional
	 */
	get isFunctional(): boolean {
		return this.component.isFunctional;
	}

	/**
	 * iBlock instance
	 */
	protected readonly component: iBlock;

	/**
	 * Async instance
	 */
	protected get async(): Async {
		// @ts-ignore
		return this.component.$async;
	}

	/**
	 * @param component - component instance
	 */
	constructor(component: iBlock) {
		this.component = component;
	}

	/**
	 * Restarts the async render daemon for forcing render
	 */
	forceAsyncRender(): void {
		restart();
	}

	/**
	 * Restarts the async render daemon for forcing render
	 * (runs on a next tick)
	 */
	deferForceAsyncRender(): void {
		deferRestart();
	}

	/**
	 * Adds a component to the render queue
	 *
	 * @param id - task id
	 * @param [group] - task group
	 */
	regAsyncComponent(id: AsyncTaskId, group: AsyncQueueType = 'asyncComponents'): AsyncTaskSimpleId {
		id = Object.isFunction(id) ? id() : id;

		let
			filter,
			simpleId,
			weight;

		if (Object.isObject(id)) {
			simpleId = (<AsyncTaskObjectId>id).id;
			filter = (<AsyncTaskObjectId>id).filter;
			weight = (<AsyncTaskObjectId>id).weight;

		} else {
			simpleId = id;
		}

		weight =
			weight ||
			this.weight ||
			this.isFunctional ? 0.5 : 1;

		const
			cursor = group === 'asyncComponents' ? queue : backQueue,
			store = <Dictionary>this.component[group];

		if (!(simpleId in store)) {
			const obj = {
				weight,
				fn: this.async.proxy(() => {
					if (filter && !filter(simpleId)) {
						return false;
					}

					store[simpleId] = true;
					return true;

				}, {
					onClear: () => cursor.delete(obj),
					single: false,
					group
				})
			};

			// @ts-ignore
			c.$set(store, simpleId, false);
			cursor.add(obj);
		}

		return simpleId;
	}

	/**
	 * Adds a component to the background render queue
	 * @param id - task id
	 */
	regAsyncBackComponent(id: AsyncTaskId): AsyncTaskSimpleId {
		return this.regAsyncComponent(id, 'asyncBackComponents');
	}

	/**
	 * Executes the specified render object
	 *
	 * @param renderObj
	 * @param [ctx] - render context
	 */
	execRenderObject(
		renderObj: RenderObject,
		ctx?: RenderContext | [Dictionary] | [Dictionary, RenderContext]
	): VNode {
		let
			instanceCtx,
			renderCtx;

		if (ctx && Object.isArray(ctx)) {
			instanceCtx = ctx[0] || this;
			renderCtx = ctx[1];

		} else {
			instanceCtx = this;
			renderCtx = ctx;
		}

		const
			vnode = execRenderObject(renderObj, instanceCtx);

		if (renderCtx) {
			return patchVNode(vnode, instanceCtx, renderCtx);
		}

		return vnode;
	}
}
