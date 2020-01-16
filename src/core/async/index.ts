/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/async/README.md]]
 * @packageDocumentation
 */

import SyncPromise from 'core/promise/sync';
import Super, { AsyncCbOptions, ClearOptionsId, isParams } from '@v4fire/core/core/async';
import { namespaces, NamespacesDictionary } from 'core/async/const';

import {

	AsyncRequestAnimationFrameOptions,
	AsyncAnimationFrameOptions,
	AsyncDnDOptions,
	DnDEventOptions,
	AsyncCb,
	AnimationFrameCb,
	DnDCb

} from 'core/async/interface';

export * from '@v4fire/core/core/async';
export * from 'core/async/const';
export * from 'core/async/interface';

export default class Async<CTX extends object = Async<any>> extends Super<CTX> {
	/** @override */
	static namespaces: NamespacesDictionary = namespaces;

	/** @override */
	static linkNames: NamespacesDictionary = namespaces;

	/**
	 * Wrapper for requestAnimationFrame
	 *
	 * @param fn - callback function
	 * @param [element] - link for the element
	 */
	requestAnimationFrame<T = unknown>(fn: AnimationFrameCb<T, CTX>, element?: Element): Nullable<number>;

	/**
	 * Wrapper for requestAnimationFrame
	 *
	 * @param fn - callback function
	 * @param opts - additional options for the operation
	 */
	requestAnimationFrame<T = unknown>(
		fn: AnimationFrameCb<T, CTX>,
		opts: AsyncRequestAnimationFrameOptions<CTX>
	): Nullable<number>;

	requestAnimationFrame<T>(
		fn: AnimationFrameCb<T, CTX>,
		p?: Element | AsyncRequestAnimationFrameOptions<CTX>
	): Nullable<number> {
		if (Object.isDictionary(p)) {
			return this.registerTask({
				...p,
				name: this.namespaces.animationFrame,
				obj: fn,
				clearFn: cancelAnimationFrame,
				wrapper: requestAnimationFrame,
				linkByWrapper: true,
				args: p.element
			});
		}

		return this.registerTask({
			name: this.namespaces.animationFrame,
			obj: fn,
			clearFn: cancelAnimationFrame,
			wrapper: requestAnimationFrame,
			linkByWrapper: true,
			args: p
		});
	}

	/**
	 * Wrapper for cancelAnimationFrame
	 *
	 * @alias
	 * @param [id] - operation id (if not specified, then the operation will be applied for all registered tasks)
	 */
	cancelAnimationFrame(id?: number): this;

	/**
	 * Clears the specified "requestAnimationFrame" timer or a group of timers
	 * @param opts - options for the operation
	 */
	cancelAnimationFrame(opts: ClearOptionsId<number>): this;
	cancelAnimationFrame(task?: number | ClearOptionsId<number>): this {
		return this.clearAnimationFrame(<any>task);
	}

	/**
	 * Wrapper for cancelAnimationFrame
	 * @param [id] - operation id (if not specified, then the operation will be applied for all registered tasks)
	 */
	clearAnimationFrame(id?: number): this;

	/**
	 * Clears the specified "requestAnimationFrame" timer or a group of timers
	 * @param opts - options for the operation
	 */
	clearAnimationFrame(opts: ClearOptionsId<number>): this;
	clearAnimationFrame(task?: number | ClearOptionsId<number>): this {
		return this
			.cancelTask(task, this.namespaces.animationFrame)
			.cancelTask(task, this.namespaces.animationFramePromise);
	}

	/**
	 * Mutes the specified "requestAnimationFrame" timer
	 * @param [id] - operation id (if not specified, then the operation will be applied for all registered tasks)
	 */
	muteAnimationFrame(id?: number): this;

	/**
	 * Mutes the specified "requestAnimationFrame" timer or a group of timers
	 * @param opts - options for the operation
	 */
	muteAnimationFrame(opts: ClearOptionsId<number>): this;
	muteAnimationFrame(task?: number | ClearOptionsId<number>): this {
		return this.markTask('muted', task, this.namespaces.animationFrame);
	}

	/**
	 * Unmutes the specified "requestAnimationFrame" timer
	 * @param [id] - operation id (if not specified, then the operation will be applied for all registered tasks)
	 */
	unmuteAnimationFrame(id?: number): this;

	/**
	 * Unmutes the specified "requestAnimationFrame" timer or a group of timers
	 * @param opts - options for the operation
	 */
	unmuteAnimationFrame(opts: ClearOptionsId<number>): this;
	unmuteAnimationFrame(task?: number | ClearOptionsId<number>): this {
		return this.markTask('!muted', task, this.namespaces.animationFrame);
	}

	/**
	 * Suspends the specified "requestAnimationFrame" timer
	 * @param [id] - operation id (if not specified, then the operation will be applied for all registered tasks)
	 */
	suspendAnimationFrame(id?: number): this;

	/**
	 * Suspends the specified "requestAnimationFrame" timer or a group of timers
	 * @param opts - options for the operation
	 */
	suspendAnimationFrame(opts: ClearOptionsId<number>): this;
	suspendAnimationFrame(task?: number | ClearOptionsId<number>): this {
		return this.markTask('paused', task, this.namespaces.animationFrame);
	}

	/**
	 * Unsuspends the specified "requestAnimationFrame" timer
	 * @param [id] - operation id (if not specified, then the operation will be applied for all registered tasks)
	 */
	unsuspendAnimationFrame(id?: number): this;

	/**
	 * Unsuspends the specified "requestAnimationFrame" timer or a group of timers
	 * @param opts - options for the operation
	 */
	unsuspendAnimationFrame(opts: ClearOptionsId<number>): this;
	unsuspendAnimationFrame(task?: number | ClearOptionsId<number>): this {
		return this.markTask('!paused', task, this.namespaces.animationFrame);
	}

	/**
	 * Returns a promise that will be resolved on the next animation frame request
	 * @param [element] - link for the element
	 */
	animationFrame(element?: Element): SyncPromise<number>;

	/**
	 * Returns a promise that will be resolved on the next animation frame request
	 * @param opts - options for the operation
	 */
	animationFrame(opts: AsyncAnimationFrameOptions): SyncPromise<number>;
	animationFrame(p?: Element | AsyncAnimationFrameOptions): SyncPromise<number> {
		return new SyncPromise((resolve, reject) => {
			if (Object.isDictionary(p)) {
				return this.requestAnimationFrame(resolve, {
					...p,
					promise: true,
					element: p.element,
					onClear: <AsyncCb<CTX>>this.onPromiseClear(resolve, reject)
				});
			}

			return this.requestAnimationFrame(resolve, {
				promise: true,
				element: p,
				onClear: <AsyncCb<CTX>>this.onPromiseClear(resolve, reject)
			});
		});
	}

	/**
	 * Adds Drag&Drop listeners to the specified element
	 *
	 * @param el
	 * @param [useCapture]
	 */
	dnd(el: Element, useCapture?: boolean): Nullable<string>;

	/**
	 * Adds Drag&Drop listeners to the specified element
	 *
	 * @param el
	 * @param opts - options for the operation
	 */
	dnd<T = unknown>(el: Element, opts: AsyncDnDOptions<T, CTX>): Nullable<string>;
	dnd<T>(el: Element, opts?: boolean | AsyncDnDOptions<T, CTX>): Nullable<string> {
		let
			useCapture,
			p: AsyncDnDOptions<T, CTX> & AsyncCbOptions<CTX>;

		if (isParams<AsyncDnDOptions<T, CTX>>(opts)) {
			useCapture = opts.options && opts.options.capture;
			p = opts;

		} else {
			useCapture = opts;
			p = {};
		}

		p.group = p.group || `dnd.${Math.random()}`;

		if (this.locked) {
			return null;
		}

		const
			clearHandlers = p.onClear = (<any[]>[]).concat(p.onClear || []);

		function dragStartClear(...args: unknown[]): void {
			for (let i = 0; i < clearHandlers.length; i++) {
				clearHandlers[i].call(this, ...args, 'dragstart');
			}
		}

		function dragClear(...args: unknown[]): void {
			for (let i = 0; i < clearHandlers.length; i++) {
				clearHandlers[i].call(this, ...args, 'drag');
			}
		}

		function dragEndClear(...args: unknown[]): void {
			for (let i = 0; i < clearHandlers.length; i++) {
				clearHandlers[i].call(this, ...args, 'dragend');
			}
		}

		const dragStartUseCapture = !p.onDragStart || Object.isFunction(p.onDragStart) ?
			useCapture : Boolean(p.onDragStart.capture);

		const dragUseCapture = !p.onDrag || Object.isFunction(p.onDrag) ?
			useCapture : Boolean(p.onDrag.capture);

		const dragEndUseCapture = !p.onDragEnd || Object.isFunction(p.onDragEnd) ?
			useCapture : Boolean(p.onDragEnd.capture);

		const
			that = this,
			asyncOpts = {join: p.join, label: p.label, group: p.group};

		function dragStart(this: CTX, e: Event): void {
			e.preventDefault();

			let res;
			if (p.onDragStart) {
				res = (<DnDCb>((<DnDEventOptions>p.onDragStart).handler || p.onDragStart)).call(this, e, el);
			}

			const drag = (e) => {
				e.preventDefault();

				if (res !== false && p.onDrag) {
					res = (<DnDCb>((<DnDEventOptions>p.onDrag).handler || p.onDrag)).call(this, e, el);
				}
			};

			const
				links: object[] = [];

			{
				const
					e = ['mousemove', 'touchmove'];

				for (let i = 0; i < e.length; i++) {
					const
						link = that.on(document, e[i], drag, {...asyncOpts, onClear: dragClear}, dragUseCapture);

					if (link) {
						links.push(link);
					}
				}
			}

			const dragEnd = (e) => {
				e.preventDefault();

				if (res !== false && p.onDragEnd) {
					res = (<DnDCb>((<DnDEventOptions>p.onDragEnd).handler || p.onDragEnd)).call(this, e, el);
				}

				for (let i = 0; i < links.length; i++) {
					that.off({
						id: links[i],
						group: p.group
					});
				}
			};

			{
				const
					e = ['mouseup', 'touchend'];

				for (let i = 0; i < e.length; i++) {
					const
						link = that.on(document, e[i], dragEnd, {...asyncOpts, onClear: dragEndClear}, dragEndUseCapture);

					if (link) {
						links.push(link);
					}
				}
			}
		}

		this.on<Event>(el, 'mousedown touchstart', dragStart, {...asyncOpts, onClear: dragStartClear}, dragStartUseCapture);
		return p.group;
	}
}
