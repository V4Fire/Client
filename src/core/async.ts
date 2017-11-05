/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import $C = require('collection.js');
import Super, { AsyncCbOpts, ClearOpts, ClearOptsId } from '@v4fire/core/async';
export * from '@v4fire/core/async';

export interface NodeEventCb {
	(e: Event, el: Node): void;
}

export interface NodeEventOpts {
	capture?: boolean;
	handler: NodeEventCb;
}

export default class Async<CTX extends Object> extends Super<CTX> {
	/**
	 * Wrapper for requestAnimationFrame
	 *
	 * @param fn - callback function
	 * @param [element] - link for the element
	 */
	requestAnimationFrame(fn: (timeStamp: number) => void, element?: HTMLElement): number;

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
	requestAnimationFrame(fn: (timeStamp: number) => void, params: AsyncCbOpts & {element?: HTMLElement}): number;

	// tslint:disable-next-line
	requestAnimationFrame(fn, p) {
		return this.setAsync({
			...Object.isObject(p) ? p : undefined,
			name: 'animationFrame',
			obj: fn,
			clearFn: cancelAnimationFrame,
			wrapper: requestAnimationFrame,
			linkByWrapper: true,
			args: p && (this.getIfNotObject(p) || p.element)
		});
	}

	/**
	 * Wrapper for cancelAnimationFrame
	 * @param [id] - operation id (if not defined will be remove all handlers)
	 */
	cancelAnimationFrame(id?: number): this;

	/**
	 * @param params - parameters for the operation:
	 *   *) [id] - operation id
	 *   *) [label] - label for the task
	 *   *) [group] - group name for the task
	 */
	cancelAnimationFrame(params: ClearOptsId<number>): this;

	// tslint:disable-next-line
	cancelAnimationFrame(p) {
		if (p === undefined) {
			return this.clearAllAsync({name: 'animationFrame', clearFn: cancelAnimationFrame});
		}

		return this.clearAsync({
			...p,
			name: 'animationFrame',
			clearFn: cancelAnimationFrame,
			id: p.id || this.getIfNotObject(p)
		});
	}

	/**
	 * Promise for requestAnimationFrame
	 * @param [element] - link for the element
	 */
	animationFrame(element?: HTMLElement): Promise<number>;

	/**
	 * @param params - parameters for the operation:
	 *   *) [element] - link for the element
	 *   *) [join] - if true, then competitive tasks (with same labels) will be joined to the first
	 *   *) [label] - label for the task (previous task with the same label will be canceled)
	 *   *) [group] - group name for the task
	 *   *) [onClear] - clear handler
	 */
	animationFrame(params: AsyncCbOpts & {element?: HTMLElement}): Promise<number>;

	// tslint:disable-next-line
	animationFrame(p) {
		return new Promise((resolve, reject) => {
			this.requestAnimationFrame(resolve, {
				...Object.isObject(p) ? p : undefined,
				element: p && (this.getIfNotObject(p) || p.element),
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
	dnd(el: HTMLElement, useCapture?: boolean): string | symbol;

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
	dnd(el: HTMLElement, params: AsyncCbOpts & {
		options?: AddEventListenerOptions;
		onDragStart?: NodeEventCb | NodeEventOpts;
		onDrag?: NodeEventCb | NodeEventOpts;
		onDragEnd?: NodeEventCb | NodeEventOpts;
	}): string | symbol;

	// tslint:disable-next-line
	dnd(el, p) {
		let
			useCapture;

		if (Object.isObject(p)) {
			useCapture = p.options && p.options.capture;

		} else {
			useCapture = p;
			p = {};
		}

		(<any>p).group = p.group || `dnd.${Math.random()}`;
		(<any>p).onClear = (<Function[]>[]).concat(p.onClear || []);

		// tslint:disable-next-line
		function dragStartClear(...args) {
			$C(p.onClear).forEach((fn) => fn.call(this, ...args, 'dragstart'));
		}

		// tslint:disable-next-line
		function dragClear(...args) {
			$C(p.onClear).forEach((fn) => fn.call(this, ...args, 'drag'));
		}

		// tslint:disable-next-line
		function dragEndClear(...args) {
			$C(p.onClear).forEach((fn) => fn.call(this, ...args, 'dragend'));
		}

		const dragStartUseCapture = Boolean(
			p.onDragStart && Object.isBoolean((<any>p.onDragStart).capture) ?
				(<NodeEventOpts>p.onDragStart).capture : useCapture
		);

		const dragUseCapture = Boolean(
			p.onDrag && Object.isBoolean((<any>p.onDrag).capture) ?
				(<NodeEventOpts>p.onDrag).capture : useCapture
		);

		const dragEndUseCapture = Boolean(
			p.onDragEnd && Object.isBoolean((<any>p.onDragEnd).capture) ?
				(<NodeEventOpts>p.onDragEnd).capture : useCapture
		);

		const
			that = this,
			opts = {join: p.join, label: p.label, group: p.group};

		function dragStart(e: Event): void {
			e.preventDefault();

			let res;
			if (p.onDragStart) {
				res = (<NodeEventCb>((<NodeEventOpts>p.onDragStart).handler || p.onDragStart)).call(this, e, el);
			}

			const drag = (e) => {
				e.preventDefault();

				if (res !== false && p.onDrag) {
					res = (<NodeEventCb>((<NodeEventOpts>p.onDrag).handler || p.onDrag)).call(this, e, el);
				}
			};

			const
				links: any[] = [];

			$C(['mousemove', 'touchmove']).forEach((e) => {
				links.push(that.on(document, e, drag, {...opts, onClear: dragClear}, dragUseCapture));
			});

			const dragEnd = (e) => {
				e.preventDefault();

				if (res !== false && p.onDragEnd) {
					res = (<NodeEventCb>((<NodeEventOpts>p.onDragEnd).handler || p.onDragEnd)).call(this, e, el);
				}

				$C(links).forEach((id) => that.off({id, group: p.group}));
			};

			$C(['mouseup', 'touchend']).forEach((e) => {
				links.push(that.on(document, e, dragEnd, {...opts, onClear: dragEndClear}, dragEndUseCapture));
			});
		}

		this.on(el, 'mousedown touchstart', dragStart, {...opts, onClear: dragStartClear}, dragStartUseCapture);
		return p.group;
	}

	/** @override */
	clearAll(params?: ClearOpts): this {
		const p: any = params;
		this.cancelAnimationFrame(p);
		return super.clearAll(p);
	}
}
