/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import $C = require('collection.js');
import Super, {

	AsyncOpts,
	AsyncCbOpts,
	AsyncOnOpts,
	ClearOptsId,
	LinkNamesList,
	ProxyCb,
	isParams

} from '@v4fire/core/core/async';

import { convertEnumToDict } from 'core/helpers/other';
export * from '@v4fire/core/core/async';

export interface AsyncRequestAnimationFrameOpts<T extends object = Async> extends AsyncCbOpts<T> {
	element?: Element;
}

export interface AsyncAnimationFrameOpts extends AsyncOpts {
	element?: Element;
}

export interface AsyncDnDOpts<R = unknown, CTX extends object = Async> extends AsyncOnOpts<CTX> {
	onDragStart?: DnDCb<R, CTX> | DnDEventOpts<R, CTX>;
	onDrag?: DnDCb<R, CTX> | DnDEventOpts<R, CTX>;
	onDragEnd?: DnDCb<R, CTX> | DnDEventOpts<R, CTX>;
}

export type DnDCb<R = unknown, CTX extends object = Async> = (this: CTX, e: Event, el: Node) => R | Function;
export type AnimationFrameCb<R = unknown, CTX extends object = Async> = ProxyCb<number, R, CTX>;

export interface DnDEventOpts<R = unknown, CTX extends object = Async> {
	capture?: boolean;
	handler: DnDCb<R, CTX>;
}

export enum ClientLinkNames {
	animationFrame
}

export type ClientLink = keyof typeof ClientLinkNames;
export type ClientLinkNamesList = LinkNamesList & Record<ClientLink, ClientLink>;

const
	linkNamesDictionary = <Record<ClientLink, ClientLink>>convertEnumToDict(ClientLinkNames);

export default class Async<CTX extends object = Async<any>> extends Super<CTX> {
	/** @override */
	static linkNames: ClientLinkNamesList = {...Super.linkNames, ...linkNamesDictionary};

	/**
	 * Wrapper for requestAnimationFrame
	 *
	 * @param fn - callback function
	 * @param [element] - link for the element
	 */
	requestAnimationFrame<T = unknown>(fn: AnimationFrameCb<T, CTX>, element?: Element): number;

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
	requestAnimationFrame<T = unknown>(fn: AnimationFrameCb<T, CTX>, params: AsyncRequestAnimationFrameOpts<CTX>): number;
	requestAnimationFrame<T>(fn: AnimationFrameCb<T, CTX>, p: any): number {
		const
			isObj = Object.isObject(p);

		return this.setAsync({
			...isObj ? p : undefined,
			name: Async.linkNames.animationFrame,
			obj: fn,
			clearFn: cancelAnimationFrame,
			wrapper: requestAnimationFrame,
			linkByWrapper: true,
			args: isObj ? p.element : p
		});
	}

	/**
	 * Wrapper for cancelAnimationFrame
	 * @param [id] - operation id (if not defined will be get all handlers)
	 */
	cancelAnimationFrame(id?: number): this;

	/**
	 * @param params - parameters for the operation:
	 *   *) [id] - operation id
	 *   *) [label] - label for the task
	 *   *) [group] - group name for the task
	 */
	cancelAnimationFrame(params: ClearOptsId<number>): this;
	cancelAnimationFrame(p: any): this {
		return this.clearAsync(p, Async.linkNames.animationFrame);
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
	muteAnimationFrame(params: ClearOptsId<number>): this;
	muteAnimationFrame(p: any): this {
		return this.markAsync('muted', p, Async.linkNames.animationFrame);
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
	unmuteAnimationFrame(params: ClearOptsId<number>): this;
	unmuteAnimationFrame(p: any): this {
		return this.markAsync('!muted', p, Async.linkNames.animationFrame);
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
	suspendAnimationFrame(params: ClearOptsId<number>): this;
	suspendAnimationFrame(p: any): this {
		return this.markAsync('paused', p, Async.linkNames.animationFrame);
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
	unsuspendAnimationFrame(params: ClearOptsId<number>): this;
	unsuspendAnimationFrame(p: any): this {
		return this.markAsync('!paused', p, Async.linkNames.animationFrame);
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
	animationFrame(params: AsyncAnimationFrameOpts): Promise<number>;
	animationFrame(p: any): Promise<number> {
		const
			isObj = Object.isObject(p);

		return new Promise((resolve, reject) => {
			this.requestAnimationFrame(resolve, {
				...isObj ? p : undefined,
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
	dnd(el: Element, useCapture?: boolean): string | symbol;

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
	dnd<T = unknown>(el: Element, params: AsyncDnDOpts<T, CTX>): string | symbol;
	dnd<T>(el: Element, params?: boolean | AsyncDnDOpts<T, CTX>): string | symbol {
		let
			useCapture,
			p!: AsyncDnDOpts<CTX> & AsyncCbOpts<CTX>;

		if (isParams<AsyncDnDOpts<T, CTX>>(params)) {
			useCapture = params.options && params.options.capture;
			p = <any>params;

		} else {
			useCapture = params;
			p = {};
		}

		p.group = p.group || `dnd.${Math.random()}`;
		p.onClear = (<any[]>[]).concat(p.onClear || []);

		function dragStartClear(...args: unknown[]): void {
			$C(p.onClear).forEach((fn) => fn.call(this, ...args, 'dragstart'));
		}

		function dragClear(...args: unknown[]): void {
			$C(p.onClear).forEach((fn) => fn.call(this, ...args, 'drag'));
		}

		function dragEndClear(...args: unknown[]): void {
			$C(p.onClear).forEach((fn) => fn.call(this, ...args, 'dragend'));
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
				res = (<DnDCb>((<DnDEventOpts>p.onDragStart).handler || p.onDragStart)).call(this, e, el);
			}

			const drag = (e) => {
				e.preventDefault();

				if (res !== false && p.onDrag) {
					res = (<DnDCb>((<DnDEventOpts>p.onDrag).handler || p.onDrag)).call(this, e, el);
				}
			};

			const
				links: object[] = [];

			$C(['mousemove', 'touchmove']).forEach((e) => {
				links.push(that.on(document, e, drag, {...opts, onClear: dragClear}, dragUseCapture));
			});

			const dragEnd = (e) => {
				e.preventDefault();

				if (res !== false && p.onDragEnd) {
					res = (<DnDCb>((<DnDEventOpts>p.onDragEnd).handler || p.onDragEnd)).call(this, e, el);
				}

				$C(links).forEach((id) => that.off({id, group: p.group}));
			};

			$C(['mouseup', 'touchend']).forEach((e) => {
				links.push(that.on(document, e, dragEnd, {...opts, onClear: dragEndClear}, dragEndUseCapture));
			});
		}

		this.on<Event>(el, 'mousedown touchstart', dragStart, {...opts, onClear: dragStartClear}, dragStartUseCapture);
		return p.group;
	}
}
