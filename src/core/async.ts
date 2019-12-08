/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Super, {

	AsyncOptions,
	AsyncCbOptions,
	AsyncOnOptions,
	ClearOptionsId,
	Link as SuperLink,
	ProxyCb,
	isParams

} from '@v4fire/core/core/async';

export * from '@v4fire/core/core/async';
export interface AsyncRequestAnimationFrameOptions<CTX extends object = Async> extends AsyncCbOptions<CTX> {
	element?: Element;
}

export interface AsyncAnimationFrameOptions extends AsyncOptions {
	element?: Element;
}

export interface AsyncDnDOptions<R = unknown, CTX extends object = Async> extends AsyncOnOptions<CTX> {
	onDragStart?: DnDCb<R, CTX> | DnDEventOptions<R, CTX>;
	onDrag?: DnDCb<R, CTX> | DnDEventOptions<R, CTX>;
	onDragEnd?: DnDCb<R, CTX> | DnDEventOptions<R, CTX>;
}

export type DnDCb<R = unknown, CTX extends object = Async> = Function | ((this: CTX, e: MouseEvent, el: Node) => R);
export type AnimationFrameCb<R = unknown, CTX extends object = Async> = ProxyCb<number, R, CTX>;

export interface DnDEventOptions<R = unknown, CTX extends object = Async> {
	capture?: boolean;
	handler: DnDCb<R, CTX>;
}

export enum ClientLinkNames {
	animationFrame,
	animationFramePromise
}

const
	linkNamesDictionary = {...Super.linkNames, ...Object.convertEnumToDict(ClientLinkNames)};

export type ClientLink = keyof typeof ClientLinkNames;
export type Link = SuperLink | ClientLink;
export type LinkNamesList = typeof linkNamesDictionary;

export default class Async<CTX extends object = Async<any>> extends Super<CTX> {
	/** @override */
	static linkNames: LinkNamesList = linkNamesDictionary;

	/** @override */
	protected get linkNames(): LinkNamesList {
		return (<typeof Async>this.constructor).linkNames;
	}

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
	 * @param params - parameters for the operation:
	 *   *) [element] - link for the element
	 *   *) [join] - if true, then competitive tasks (with same labels) will be joined to the first
	 *   *) [label] - label for the task (previous task with the same label will be canceled)
	 *   *) [group] - group name for the task
	 *   *) [onClear] - clear handler
	 */
	requestAnimationFrame<T = unknown>(
		fn: AnimationFrameCb<T, CTX>,
		params: AsyncRequestAnimationFrameOptions<CTX>
	): Nullable<number>;

	requestAnimationFrame<T>(fn: AnimationFrameCb<T, CTX>, p: any): Nullable<number> {
		const
			isObj = Object.isObject(p);

		return this.setAsync({
			...isObj ? p : undefined,
			name: this.linkNames.animationFrame,
			obj: fn,
			clearFn: cancelAnimationFrame,
			wrapper: requestAnimationFrame,
			linkByWrapper: true,
			args: isObj ? p.element : p
		});
	}

	/**
	 * Wrapper for cancelAnimationFrame
	 *
	 * @alias
	 * @param [id] - operation id (if not defined will be get all handlers)
	 */
	cancelAnimationFrame(id?: number): this;

	/**
	 * @param params - parameters for the operation:
	 *   *) [id] - operation id
	 *   *) [label] - label for the task
	 *   *) [group] - group name for the task
	 */
	cancelAnimationFrame(params: ClearOptionsId<number>): this;
	cancelAnimationFrame(p: any): this {
		return this.clearAnimationFrame(p);
	}

	/**
	 * Wrapper for cancelAnimationFrame
	 * @param [id] - operation id (if not defined will be get all handlers)
	 */
	clearAnimationFrame(id?: number): this;

	/**
	 * @param params - parameters for the operation:
	 *   *) [id] - operation id
	 *   *) [label] - label for the task
	 *   *) [group] - group name for the task
	 */
	clearAnimationFrame(params: ClearOptionsId<number>): this;
	clearAnimationFrame(p: any): this {
		return this
			.clearAsync(p, this.linkNames.animationFrame)
			.clearAsync(p, this.linkNames.animationFramePromise);
	}

	/**
	 * Mutes a requestAnimationFrame operation
	 * @param [id] - operation id (if not defined will be get all handlers)
	 */
	muteAnimationFrame(id?: number): this;

	/**
	 * @param params - parameters for the operation:
	 *   *) [id] - operation id
	 *   *) [label] - label for the task
	 *   *) [group] - group name for the task
	 */
	muteAnimationFrame(params: ClearOptionsId<number>): this;
	muteAnimationFrame(p: any): this {
		return this.markAsync('muted', p, this.linkNames.animationFrame);
	}

	/**
	 * Unmutes a requestAnimationFrame operation
	 * @param [id] - operation id (if not defined will be get all handlers)
	 */
	unmuteAnimationFrame(id?: number): this;

	/**
	 * @param params - parameters for the operation:
	 *   *) [id] - operation id
	 *   *) [label] - label for the task
	 *   *) [group] - group name for the task
	 */
	unmuteAnimationFrame(params: ClearOptionsId<number>): this;
	unmuteAnimationFrame(p: any): this {
		return this.markAsync('!muted', p, this.linkNames.animationFrame);
	}

	/**
	 * Suspends a requestAnimationFrame operation
	 * @param [id] - operation id (if not defined will be get all handlers)
	 */
	suspendAnimationFrame(id?: number): this;

	/**
	 * @param params - parameters for the operation:
	 *   *) [id] - operation id
	 *   *) [label] - label for the task
	 *   *) [group] - group name for the task
	 */
	suspendAnimationFrame(params: ClearOptionsId<number>): this;
	suspendAnimationFrame(p: any): this {
		return this.markAsync('paused', p, this.linkNames.animationFrame);
	}

	/**
	 * Unsuspends a requestAnimationFrame operation
	 * @param [id] - operation id (if not defined will be get all handlers)
	 */
	unsuspendAnimationFrame(id?: number): this;

	/**
	 * @param params - parameters for the operation:
	 *   *) [id] - operation id
	 *   *) [label] - label for the task
	 *   *) [group] - group name for the task
	 */
	unsuspendAnimationFrame(params: ClearOptionsId<number>): this;
	unsuspendAnimationFrame(p: any): this {
		return this.markAsync('!paused', p, this.linkNames.animationFrame);
	}

	/**
	 * Promise for requestAnimationFrame
	 * @param [element] - link for the element
	 */
	animationFrame(element?: Element): Promise<number>;

	/**
	 * @param params - parameters for the operation:
	 *   *) [element] - link for the element
	 *   *) [join] - if true, then competitive tasks (with same labels) will be joined to the first
	 *   *) [label] - label for the task (previous task with the same label will be canceled)
	 *   *) [group] - group name for the task
	 */
	animationFrame(params: AsyncAnimationFrameOptions): Promise<number>;
	animationFrame(p: any): Promise<number> {
		const
			isObj = Object.isObject(p);

		return new Promise((resolve, reject) => {
			this.requestAnimationFrame(resolve, {
				...isObj ? p : undefined,
				promise: true,
				element: isObj ? p.element : p,
				onClear: this.onPromiseClear(resolve, reject)
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
	 * @param el
	 * @param params - parameters for the operation:
	 *   *) [options] - additional options for addEventListener
	 *   *) [join] - if true, then competitive tasks (with same labels) will be joined to the first
	 *   *) [label] - label for the task (previous task with the same label will be canceled)
	 *   *) [group] - group name for the task
	 *   *) [onClear] - clear handler
	 *   *) [onDragStart]
	 *   *) [onDrag]
	 *   *) [onDragEnd]
	 */
	dnd<T = unknown>(el: Element, params: AsyncDnDOptions<T, CTX>): Nullable<string>;
	dnd<T>(el: Element, params?: boolean | AsyncDnDOptions<T, CTX>): Nullable<string> {
		let
			useCapture,
			p!: AsyncDnDOptions<CTX> & AsyncCbOptions<CTX>;

		if (isParams<AsyncDnDOptions<T, CTX>>(params)) {
			useCapture = params.options && params.options.capture;
			p = <any>params;

		} else {
			useCapture = params;
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
			opts = {join: p.join, label: p.label, group: p.group};

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
						link = that.on(document, e[i], drag, {...opts, onClear: dragClear}, dragUseCapture);

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
						link = that.on(document, e[i], dragEnd, {...opts, onClear: dragEndClear}, dragEndUseCapture);

					if (link) {
						links.push(link);
					}
				}
			}
		}

		this.on<Event>(el, 'mousedown touchstart', dragStart, {...opts, onClear: dragStartClear}, dragStartUseCapture);
		return p.group;
	}
}
