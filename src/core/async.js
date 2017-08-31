'use strict';

/* eslint-disable no-unused-vars */

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	$C = require('collection.js'),
	uuid = require('uuid');

/**
 * Base class for Async IO
 *
 * @example
 * this.setImmediate(() => alert(1));                                    // 1
 * this.setImmediate({fn: () => alert(2), label: 'foo'});                // -
 * this.setImmediate({fn: () => alert(3), label: 'foo'});                // 3, calls only last task with a same label
 * this.setImmediate({fn: () => alert(4), group: 'bar'});                // 4
 * this.setImmediate({fn: () => alert(5), label: 'foo', group: 'bar'});  // -
 * this.setImmediate({fn: () => alert(6), label: 'foo', group: 'bar'});  // 6
 */
export default class Async {
	/**
	 * Cache object for async operations
	 */
	cache: ?Object;

	/**
	 * Context for functions
	 */
	context: ?Object;

	/**
	 * @param [ctx] - context for functions
	 */
	constructor(ctx?: Object) {
		this.cache = {};
		this.context = ctx;
	}

	/**
	 * Returns the specified value if it is an event object
	 * @param value
	 */
	static getIfEvent(value: any & {event?: string}): ?Function {
		return Object.isObject(value) && Object.isString(value.event) ? value : undefined;
	}

	/**
	 * Returns the specified value if it is not a plain object
	 * @param value
	 */
	static getIfNotObject(value: any): ?Function {
		return Object.isObject(value) ? undefined : value;
	}

	/**
	 * Terminates the specified worker
	 * @param worker
	 */
	static terminateWorker(worker: Worker | Socket) {
		(worker.terminate || worker.close).call(worker);
	}

	/**
	 * Terminates the specified request
	 *
	 * @param request
	 * @param [ctx] - context object
	 */
	static cancelRequest(request: Promise & {abort: Function}, ctx?: Object) {
		request.abort(ctx.join === 'replace' ? ctx.replacedBy.id : undefined);
	}

	/**
	 * Factory for promise clear handlers
	 *
	 * @param resolve
	 * @param reject
	 */
	static onPromiseClear(resolve: Function, reject: Function): Function {
		return (obj) => {
			const
				{replacedBy} = obj;

			if (replacedBy && obj.join === 'replace' && obj.link.onClear.length < 25) {
				replacedBy.onComplete.push([resolve, reject]);

				const
					onClear = [].concat(obj.link.onClear, reject);

				for (let i = 0; i < onClear.length; i++) {
					replacedBy.onClear.push(onClear[i]);
				}

			} else {
				reject(obj);
			}
		};
	}

	/**
	 * Wrapper for setImmediate
	 *
	 * @param fn
	 * @param [join] - if true, then competitive tasks (with same labels) will be joined to the first
	 * @param [label] - label for the task (previous task with the same label will be canceled)
	 * @param [group] - group name for the task
	 * @param [onClear] - clear handler
	 * @param [args] - additional arguments
	 */
	setImmediate(
		{fn, join, label, group, onClear}: {
			fn: Function,
			join?: boolean,
			label?: string | Symbol,
			group?: string | Symbol,
			onClear?: Function | Array<Function>
		} | Function,
		...args: any

	): number {
		return this._set({
			name: 'immediate',
			obj: fn || Async.getIfNotObject(arguments[0]),
			clearFn: clearImmediate,
			wrapper: setImmediate,
			linkByWrapper: true,
			onClear,
			args,
			join,
			label,
			group
		});
	}

	/**
	 * Wrapper for clearImmediate
	 *
	 * @param id - task id
	 * @param [label] - label for the task
	 * @param [group] - group name for the task
	 */
	clearImmediate(
		{id, label, group}: {
			id: number,
			label?: string | Symbol,
			group?: string | Symbol | RegExp
		} | number

	): this {
		return this._clear({
			name: 'immediate',
			clearFn: clearImmediate,
			id: id || Async.getIfNotObject(arguments[0]),
			label,
			group
		});
	}

	/**
	 * Clears all setImmediate tasks
	 */
	clearAllImmediates(): this {
		return this._clearAll({
			name: 'immediate',
			clearFn: clearImmediate
		});
	}

	/**
	 * Wrapper for setInterval
	 *
	 * @param fn
	 * @param [join] - if true, then competitive tasks (with same labels) will be joined to the first
	 * @param [label] - label for the task (previous task with the same label will be canceled)
	 * @param [group] - group name for the task
	 * @param [onClear] - clear handler
	 * @param interval
	 * @param [args] - additional arguments
	 */
	setInterval(
		{fn, join, label, group, onClear}: {
			fn: Function,
			join?: boolean,
			label?: string | Symbol,
			group?: string | Symbol,
			onClear?: Function
		} | Function,

		interval: number,
		...args: any

	): number {
		return this._set({
			name: 'interval',
			obj: fn || Async.getIfNotObject(arguments[0]),
			clearFn: clearInterval,
			wrapper: setInterval,
			linkByWrapper: true,
			interval: true,
			args: [interval, ...args],
			onClear,
			join,
			label,
			group
		});
	}

	/**
	 * Wrapper for clearInterval
	 *
	 * @param id - task id
	 * @param [label] - label for the task
	 * @param [group] - group name for the task
	 */
	clearInterval(
		{id, label, group}: {
			id: number,
			label?: string | Symbol,
			group?: string | Symbol | RegExp
		} | number

	): this {
		return this._clear({
			name: 'interval',
			clearFn: clearInterval,
			id: id || Async.getIfNotObject(arguments[0]),
			label,
			group
		});
	}

	/**
	 * Clears all setInterval tasks
	 */
	clearAllIntervals(): this {
		return this._clearAll({
			name: 'interval',
			clearFn: clearInterval
		});
	}

	/**
	 * Wrapper for setTimeout
	 *
	 * @param fn
	 * @param [join] - if true, then competitive tasks (with same labels) will be joined to the first
	 * @param [label] - label for the task (previous task with the same label will be canceled)
	 * @param [group] - group name for the task
	 * @param [onClear] - clear handler
	 * @param timer
	 * @param [args] - additional arguments
	 */
	setTimeout(
		{fn, join, label, group, onClear}: {
			fn: Function,
			join?: boolean,
			label?: string | Symbol,
			group?: string | Symbol,
			onClear?: Function
		} | Function,

		timer: number,
		...args: any

	): number {
		return this._set({
			name: 'timeout',
			obj: fn || Async.getIfNotObject(arguments[0]),
			clearFn: clearTimeout,
			wrapper: setTimeout,
			linkByWrapper: true,
			args: [timer, ...args],
			onClear,
			join,
			label,
			group
		});
	}

	/**
	 * Wrapper for clearTimeout
	 *
	 * @param id - task id
	 * @param [label] - label for the task
	 * @param [group] - group name for the task
	 */
	clearTimeout(
		{id, label, group}: {
			id: number,
			label?: string | Symbol,
			group?: string | Symbol | RegExp
		} | number

	): this {
		return this._clear({
			name: 'timeout',
			clearFn: clearTimeout,
			id: id || Async.getIfNotObject(arguments[0]),
			label,
			group
		});
	}

	/**
	 * Clears all setTimeout tasks
	 */
	clearAllTimeouts(): this {
		return this._clearAll({
			name: 'timeout',
			clearFn: clearTimeout
		});
	}

	/**
	 * Wrapper for requestAnimationFrame
	 *
	 * @param fn
	 * @param [join] - if true, then competitive tasks (with same labels) will be joined to the first
	 * @param [label] - label for the task (previous task with the same label will be canceled)
	 * @param [group] - group name for the task
	 * @param [onClear] - clear handler
	 * @param [element] - animation element
	 */
	requestAnimationFrame(
		{fn, join, label, group, onClear}: {
			fn: Function,
			join?: boolean,
			label?: string | Symbol,
			group?: string | Symbol,
			onClear?: Function
		} | Function,
		element: Element

	): number {
		return this._set({
			name: 'animationFrame',
			obj: fn || Async.getIfNotObject(arguments[0]),
			clearFn: cancelAnimationFrame,
			wrapper: requestAnimationFrame,
			linkByWrapper: true,
			args: element,
			onClear,
			join,
			label,
			group
		});
	}

	/**
	 * Wrapper for cancelAnimationFrame
	 *
	 * @param id - task id
	 * @param [label] - label for the task
	 * @param [group] - group name for the task
	 */
	cancelAnimationFrame(
		{id, label, group}: {
			id: number,
			label?: string | Symbol,
			group?: string | Symbol | RegExp
		} | number

	): this {
		return this._clear({
			name: 'animationFrame',
			clearFn: cancelAnimationFrame,
			id: id || Async.getIfNotObject(arguments[0]),
			label,
			group
		});
	}

	/**
	 * Cancels all requestAnimationFrame tasks
	 */
	cancelAllAnimationFrames(): this {
		return this._clearAll({
			name: 'animationFrame',
			clearFn: cancelAnimationFrame
		});
	}

	/**
	 * Wrapper for requestIdleCallback
	 *
	 * @param fn
	 * @param [join] - if true, then competitive tasks (with same labels) will be joined to the first
	 * @param [label] - label for the task (previous task with the same label will be canceled)
	 * @param [group] - group name for the task
	 * @param [onClear] - clear handler
	 * @param [options] - additional options
	 */
	requestIdleCallback(
		{fn, join, label, group, onClear}: {
			fn: Function,
			join?: boolean,
			label?: string | Symbol,
			group?: string | Symbol,
			onClear?: Function
		} | Function,
		options?: Object

	): number {
		return this._set({
			name: 'idleCallback',
			obj: fn || Async.getIfNotObject(arguments[0]),
			clearFn: cancelIdleCallback,
			wrapper: requestIdleCallback,
			linkByWrapper: true,
			args: options,
			onClear,
			join,
			label,
			group
		});
	}

	/**
	 * Wrapper for cancelIdleCallback
	 *
	 * @param id - task id
	 * @param [label] - label for the task
	 * @param [group] - group name for the task
	 */
	cancelIdleCallback(
		{id, label, group}: {
			id: number,
			label?: string | Symbol,
			group?: string | Symbol | RegExp
		} | number

	): this {
		return this._clear({
			name: 'idleCallback',
			clearFn: cancelIdleCallback,
			id: id || Async.getIfNotObject(arguments[0]),
			label,
			group
		});
	}

	/**
	 * Cancels all requestIdleCallback tasks
	 */
	cancelAllIdleCallbacks(): this {
		return this._clearAll({
			name: 'idleCallback',
			clearFn: cancelIdleCallback
		});
	}

	/**
	 * Proxy for a Worker instance
	 *
	 * @param worker
	 * @param [join] - if true, then competitive tasks (with same labels) will be joined to the first
	 * @param [label] - label for the task (previous task with the same label will be canceled)
	 * @param [group] - group name for the task
	 * @param [onClear] - clear handler
	 */
	worker(
		worker: Worker | Socket,
		{join, label, group, onClear}: {
			join?: boolean,
			label?: string | Symbol,
			group?: string | Symbol,
			onClear?: Function
		} = {}

	): Worker {
		return this._set({
			name: 'worker',
			obj: worker || Async.getIfNotObject(arguments[0]),
			clearFn: Async.terminateWorker,
			interval: true,
			onClear,
			join,
			label,
			group
		});
	}

	/**
	 * Terminates the specified worker
	 *
	 * @param id - task id
	 * @param [label] - label for the task
	 * @param [group] - group name for the task
	 */
	terminateWorker(
		{id, label, group}: {
			id: Worker | Socket,
			label?: string | Symbol,
			group?: string | Symbol | RegExp
		} | Worker

	): this {
		return this._clear({
			name: 'worker',
			clearFn: Async.terminateWorker,
			id: id || Async.getIfNotObject(arguments[0]),
			label,
			group
		});
	}

	/**
	 * Terminates all register workers
	 */
	terminateAllWorkers(): this {
		return this._clearAll({
			name: 'worker',
			clearFn: Async.terminateWorker
		});
	}

	/**
	 * Proxy for a request
	 *
	 * @param req
	 * @param [join] - strategy for joining competitive tasks (with same labels):
	 *   *) true - all tasks will be joined to the first;
	 *   *) 'replace' - all tasks will be joined (replaced) to the last.
	 *
	 * @param [label] - label for the task (previous task with the same label will be canceled)
	 * @param [group] - group name for the task
	 */
	request(
		req: Promise | Function,
		{join, label, group}: {
			join?: boolean | 'replace',
			label?: string | Symbol,
			group?: string | Symbol
		} | Promise = {}

	): Promise {
		return this._set({
			name: 'request',
			obj: req,
			clearFn: Async.cancelRequest,
			wrapper: (fn, req) => req.then(fn, fn),
			needCall: true,
			join,
			label,
			group
		});
	}

	/**
	 * Cancels the specified request
	 *
	 * @param id - task id
	 * @param [label] - label for the task
	 * @param [group] - group name for the task
	 */
	cancelRequest(
		{id, label, group}: {
			id: Promise,
			label?: string | Symbol,
			group?: string | Symbol | RegExp
		} | Promise

	): this {
		return this._clear({
			name: 'request',
			clearFn: Async.cancelRequest,
			id: id || Async.getIfNotObject(arguments[0]),
			label,
			group
		});
	}

	/**
	 * Cancels all register requests
	 */
	cancelAllRequests(): this {
		return this._clearAll({
			name: 'request',
			clearFn: Async.cancelRequest
		});
	}

	/**
	 * Proxy for some callback function
	 *
	 * @param fn
	 * @param [single] - if false, the operation won't be cleared after first execution
	 * @param [join] - if true, then competitive tasks (with same labels) will be joined to the first
	 * @param [label] - label for the task (previous task with the same label will be canceled)
	 * @param [group] - group name for the task
	 * @param [onClear] - clear handler
	 */
	proxy(
		fn: Function,
		{single = true, join, label, group, onClear}: {
			single: ?boolean,
			join?: boolean,
			label?: string | Symbol,
			group?: string | Symbol,
			onClear?: Function
		} = {}

	): Function {
		return this._set({
			name: 'proxy',
			obj: fn,
			wrapper: (fn) => fn,
			linkByWrapper: true,
			interval: !single,
			onClear,
			join,
			label,
			group
		});
	}

	/**
	 * Cancels the specified callback function
	 *
	 * @param id - task id
	 * @param [label] - label for the task
	 * @param [group] - group name for the task
	 */
	cancelProxy(
		{id, label, group}: {
			id: Function,
			label?: string | Symbol,
			group?: string | Symbol | RegExp
		} | Function

	): this {
		return this._clear({
			name: 'proxy',
			id: id || Async.getIfNotObject(arguments[0]),
			label,
			group
		});
	}

	/**
	 * Cancels all register functions
	 */
	cancelAllProxies(): this {
		return this._clearAll({name: 'proxy'});
	}

	/**
	 * Proxy for a promise
	 *
	 * @param promise
	 * @param [join] - strategy for joining competitive tasks (with same labels):
	 *   *) true - all tasks will be joined to the first;
	 *   *) 'replace' - all tasks will be joined (replaced) to the last.
	 *
	 * @param [label] - label for the task (previous task with the same label will be canceled)
	 * @param [group] - group name for the task
	 */
	promise(
		promise: Promise,
		{join, label, group}?: {
			join?: boolean | 'replace',
			label?: string | Symbol,
			group?: string | Symbol
		} = {}

	): Promise {
		return new Promise((resolve, reject) => {
			promise.then(
				this.proxy(resolve, {
					join,
					label,
					group,
					onClear: Async.onPromiseClear(resolve, reject)
				}),

				reject
			);
		});
	}

	/**
	 * Promise for setTimeout
	 *
	 * @param timer
	 * @param [join] - strategy for joining competitive tasks (with same labels):
	 *   *) true - all tasks will be joined to the first;
	 *   *) 'replace' - all tasks will be joined (replaced) to the last.
	 *
	 * @param [label] - label for the task (previous task with the same label will be canceled)
	 * @param [group] - group name for the task
	 */
	sleep(
		timer: number,
		{join, label, group}?: {
			join?: boolean | 'replace',
			label?: string | Symbol,
			group?: string | Symbol
		} = {}

	): Promise {
		return new Promise((resolve, reject) => {
			this.setTimeout(
				{
					join,
					label,
					group,
					fn: resolve,
					onClear: Async.onPromiseClear(resolve, reject)
				},

				timer
			);
		});
	}

	/**
	 * Promise for setImmediate
	 *
	 * @param [join] - strategy for joining competitive tasks (with same labels):
	 *   *) true - all tasks will be joined to the first;
	 *   *) 'replace' - all tasks will be joined (replaced) to the last.
	 *
	 * @param [label] - label for the task (previous task with the same label will be canceled)
	 * @param [group] - group name for the task
	 */
	nextTick(
		{join, label, group}?: {
			join?: boolean | 'replace',
			label?: string | Symbol,
			group?: string | Symbol
		} = {}

	): Promise {
		return new Promise((resolve, reject) => {
			this.setImmediate({
				join,
				label,
				group,
				fn: resolve,
				onClear: Async.onPromiseClear(resolve, reject)
			});
		});
	}

	/**
	 * Promise for requestIdleCallback
	 *
	 * @param [join] - strategy for joining competitive tasks (with same labels):
	 *   *) true - all tasks will be joined to the first;
	 *   *) 'replace' - all tasks will be joined (replaced) to the last.
	 *
	 * @param [label] - label for the task (previous task with the same label will be canceled)
	 * @param [group] - group name for the task
	 */
	idle(
		{join, label, group}?: {
			join?: boolean | 'replace',
			label?: string | Symbol,
			group?: string | Symbol
		} = {}

	): Promise {
		return new Promise((resolve, reject) => {
			this.requestIdleCallback({
				join,
				label,
				group,
				fn: resolve,
				onClear: Async.onPromiseClear(resolve, reject)
			});
		});
	}

	/**
	 * Promise for requestAnimationFrame
	 *
	 * @param [join] - strategy for joining competitive tasks (with same labels):
	 *   *) true - all tasks will be joined to the first;
	 *   *) 'replace' - all tasks will be joined (replaced) to the last.
	 *
	 * @param [label] - label for the task (previous task with the same label will be canceled)
	 * @param [group] - group name for the task
	 */
	animationFrame(
		{join, label, group}?: {
			join?: boolean | 'replace',
			label?: string | Symbol,
			group?: string | Symbol
		} = {}

	): Promise {
		return new Promise((resolve, reject) => {
			this.requestAnimationFrame({
				join,
				label,
				group,
				fn: resolve,
				onClear: Async.onPromiseClear(resolve, reject)
			});
		});
	}

	/**
	 * Waits until the specified function returns true
	 *
	 * @param fn
	 * @param [join] - strategy for joining competitive tasks (with same labels):
	 *   *) true - all tasks will be joined to the first;
	 *   *) 'replace' - all tasks will be joined (replaced) to the last.
	 *
	 * @param [label] - label for the task (previous task with the same label will be canceled)
	 * @param [group] - group name for the task
	 */
	wait(
		fn,
		{join, label, group}?: {
			join?: boolean | 'replace',
			label?: string | Symbol,
			group?: string | Symbol
		} = {}

	): Promise {
		return new Promise((resolve, reject) => {
			const id = this.setInterval({
				fn: () => {
					if (fn()) {
						resolve();
						this.clearInterval(id);
					}
				},

				join,
				label,
				group,
				onClear: Async.onPromiseClear(resolve, reject)
			}, 15);
		});
	}

	/**
	 * Wrapper for EventEmitter.on/addEventListener
	 *
	 * @param emitter
	 * @param event
	 * @param fn
	 * @param [single] - if false, the operation won't be cleared after first execution
	 * @param [join] - if true, then competitive tasks (with same labels) will be joined to the first
	 * @param [label] - label for the task (previous task with the same label will be canceled)
	 * @param [group] - group name for the task
	 * @param [onClear] - clear handler
	 * @param [args] - additional parameters
	 */
	on(
		emitter: Object,
		event: string,

		{fn, single, join, label, group, onClear}: {
			fn: Function,
			single: ?boolean,
			join?: boolean,
			label?: string | Symbol,
			group?: string | Symbol,
			onClear?: Function
		} | Function,

		...args: any

	): Object {
		const
			events = event.split(/\s+/),
			links = [];

		for (const event of events) {
			let
				handler = fn || Async.getIfNotObject(arguments[2]);

			links.push(this._set({
				name: 'eventListener',
				obj: handler,
				clearFn({event, emitter, handler, args}) {
					(emitter.removeEventListener || emitter.off).call(emitter, event, handler, ...args);
				},

				wrapper() {
					if (single && !emitter.once) {
						const tmp = handler;
						handler = function () {
							(emitter.removeEventListener || emitter.off).call(emitter, event, handler, ...args);
							return tmp.apply(this, arguments);
						};
					}

					(single && emitter.once || emitter.addEventListener || emitter.on).call(emitter, event, handler, ...args);
					return {event, emitter, handler, args};
				},

				linkByWrapper: true,
				interval: !single,
				group: group || event,
				onClear,
				join,
				label
			}));
		}

		return events.length === 1 ? links[0] : links;
	}

	/**
	 * Wrapper for EventEmitter.once/addEventListener
	 *
	 * @param emitter
	 * @param event
	 * @param fn
	 * @param [join] - if true, then competitive tasks (with same labels) will be joined to the first
	 * @param [label] - label for the task (previous task with the same label will be canceled)
	 * @param [group] - group name for the task
	 * @param [onClear] - clear handler
	 * @param [args] - additional parameters
	 */
	once(
		emitter: Object,
		event: string,

		{fn, join, label, group, onClear}: {
			fn: Function,
			join?: boolean,
			label?: string | Symbol,
			group?: string | Symbol,
			onClear?: Function
		} | Function,

		...args: any

	): Object {
		const p = arguments[2];
		return this.on(emitter, event, Object.isFunction(p) ? {fn: p, single: true} : {...p, single: true}, ...args);
	}

	/**
	 * Promise wrapper for .once
	 *
	 * @param emitter
	 * @param event
	 * @param [join] - if true, then competitive tasks (with same labels) will be joined to the first
	 * @param [label] - label for the task (previous task with the same label will be canceled)
	 * @param [group] - group name for the task
	 * @param [args] - additional parameters
	 */
	promisifyOnce(
		emitter: Object,
		event: string,

		{join, label, group}: {
			join?: boolean,
			label?: string | Symbol,
			group?: string | Symbol
		},

		...args: any

	): Object {
		const p = arguments[2];
		return new Promise((resolve, reject) => {
			this.once(emitter, event, {
				...p,
				fn: resolve,
				onClear: Async.onPromiseClear(resolve, reject)
			}, ...args);
		});
	}

	/**
	 * Wrapper for EventEmitter.off/removeEventListener
	 *
	 * @param id - task id
	 * @param [label] - label for the task
	 * @param [group] - group name for the task
	 */
	off(
		{id, label, group}: {
			id: number,
			label?: string | Symbol,
			group?: string | Symbol | RegExp
		} | Object

	): this {
		return this._clear({
			name: 'eventListener',
			clearFn({event, emitter, handler, args}) {
				(emitter.removeEventListener || emitter.off).call(emitter, event, handler, ...args);
			},

			id: id || Async.getIfEvent(arguments[0]),
			label,
			group
		});
	}

	/**
	 * Clears all on tasks
	 */
	removeAllEventListeners(): this {
		return this._clearAll({
			name: 'eventListener',
			clearFn({event, emitter, handler, args}) {
				(emitter.removeEventListener || emitter.off).call(emitter, event, handler, ...args);
			}
		});
	}

	/**
	 * Adds Drag&Drop listeners to the specified element
	 *
	 * @param el
	 * @param [join] - if true, then competitive tasks (with same labels) will be joined to the first
	 * @param [label] - label for the task (previous task with the same label will be canceled)
	 * @param [group] - group name for the task
	 * @param [onClear] - clear handler
	 * @param [onDragStart]
	 * @param [onDrag]
	 * @param [onDragEnd]
	 * @param [useCapture]
	 */
	dnd(
		el: Element,

		{
			join,
			label,
			group = `dnd.${uuid()}`,
			onClear,
			onDragStart,
			onDrag,
			onDragEnd

		}: {
			join?: boolean,
			label?: string | Symbol,
			group?: string | Symbol,
			onClear?: (link: Object, event: string) => void,
			onDragStart?: (e: Event, el: Node) => void | {capture?: boolean, handler?: (e: Event, el: Node) => void},
			onDrag?: (e: Event, el: Node) => void | {capture?: boolean, handler?: (e: Event, el: Node) => void},
			onDragEnd?: (e: Event, el: Node) => void | {capture?: boolean, handler?: (e: Event, el: Node) => void}
		},

		useCapture?: boolean

	): string {
		function dragStartClear() {
			onClear && onClear.call(this, ...arguments, 'dragstart');
		}

		function dragClear() {
			onClear && onClear.call(this, ...arguments, 'drag');
		}

		function dragEndClear() {
			onClear && onClear.call(this, ...arguments, 'dragend');
		}

		const dragStartUseCapture = Boolean(
			onDragStart && Object.isBoolean(onDragStart.capture) ? onDragStart.capture : useCapture
		);

		const dragUseCapture = Boolean(
			onDrag && Object.isBoolean(onDrag.capture) ? onDrag.capture : useCapture
		);

		const dragEndUseCapture = Boolean(
			onDragEnd && Object.isBoolean(onDragEnd.capture) ? onDragEnd.capture : useCapture
		);

		const
			that = this,
			p = {join, label, group};

		function dragStart(e) {
			e.preventDefault();

			let res;
			if (onDragStart) {
				res = (onDragStart.handler || onDragStart).call(this, e, el);
			}

			const drag = (e) => {
				e.preventDefault();

				if (res !== false && onDrag) {
					res = (onDrag.handler || onDrag).call(this, e, el);
				}
			};

			const
				links = [];

			$C(['mousemove', 'touchmove']).forEach((e) => {
				links.push(that.on(document, e, {fn: drag, onClear: dragClear, ...p}, dragUseCapture));
			});

			const dragEnd = (e) => {
				e.preventDefault();

				if (res !== false && onDragEnd) {
					res = (onDragEnd.handler || onDragEnd).call(this, e, el);
				}

				$C(links).forEach((id) => that.off({id, group}));
			};

			$C(['mouseup', 'touchend']).forEach((e) => {
				links.push(that.on(document, e, {fn: dragEnd, onClear: dragEndClear, ...p}, dragEndUseCapture));
			});
		}

		$C(['mousedown', 'touchstart']).forEach((e) => {
			this.on(el, e, {fn: dragStart, onClear: dragStartClear, ...p}, dragStartUseCapture);
		});

		return group;
	}

	/**
	 * Clears all async operations
	 *
	 * @param [label] - label for the task
	 * @param [group] - group name for the task
	 */
	clearAll({label, group}: {label?: string | Symbol, group?: string | Symbol | RegExp} = {}): this {
		if (group || label) {
			const
				[q] = arguments;

			this
				.off(q);

			this
				.clearImmediate(q)
				.clearInterval(q)
				.clearTimeout(q)
				.cancelIdleCallback(q)
				.cancelAnimationFrame(q);

			this
				.cancelRequest(q)
				.terminateWorker(q)
				.cancelProxy(q);

		} else {
			this
				.removeAllEventListeners();

			this
				.clearAllImmediates()
				.clearAllIntervals()
				.clearAllTimeouts()
				.cancelAllIdleCallbacks()
				.cancelAllAnimationFrames();

			this
				.cancelAllRequests()
				.terminateAllWorkers()
				.cancelAllProxies();
		}

		return this;
	}

	/**
	 * Returns a cache object by the specified name
	 * @private
	 */
	_initCache(name: string): Object {
		return this.cache[name] = this.cache[name] || {
			root: {
				labels: {},
				links: new Map()
			},

			groups: {}
		};
	}

	/**
	 * Initializes the specified listener
	 * @private
	 */
	_set({
		name,
		obj,
		clearFn,
		onClear,
		wrapper,
		linkByWrapper,
		args,
		interval,
		join,
		label,
		group,
		needCall

	}): this {
		let
			cache = this._initCache(name);

		if (group) {
			cache.groups[group] = cache.groups[group] || {
				labels: {},
				links: new Map()
			};

			cache = cache.groups[group];

		} else {
			cache = cache.root;
		}

		const
			{labels, links} = cache,
			labelCache = labels[label];

		if (labelCache && join === true) {
			return labelCache;
		}

		const
			ctx = this.context;

		let
			id,
			finalObj,
			wrappedObj = id = finalObj = needCall && Object.isFunction(obj) ? obj.call(ctx || this) : obj;

		if (!interval || Object.isFunction(wrappedObj)) {
			wrappedObj = function () {
				const a = [];
				for (let i = 0; i < arguments.length; i++) {
					a.push(arguments[i]);
				}

				const
					link = links.get(id),
					ctx = ctx || this;

				if (!link) {
					return;
				}

				if (!interval) {
					links.delete(id);
					delete labels[label];
				}

				const execTasks = (i) => function () {
					const a = [];
					for (let i = 0; i < arguments.length; i++) {
						a.push(arguments[i]);
					}

					const
						fns = link.onComplete;

					if (fns) {
						for (let j = 0; j < fns.length; j++) {
							const fn = fns[j];
							(fn[i || 0] || fn).apply(ctx, a);
						}
					}
				};

				let res = finalObj;
				if (Object.isFunction(finalObj)) {
					res = finalObj.apply(ctx, a);
				}

				if (finalObj instanceof Promise) {
					finalObj.then(execTasks(), execTasks(1));

				} else {
					/* eslint-disable prefer-spread */
					execTasks().apply(null, a);
					/* eslint-enable prefer-spread */
				}

				return res;
			};
		}

		if (wrapper) {
			const
				link = wrapper(...[wrappedObj].concat(needCall ? id : [], args));

			if (linkByWrapper) {
				id = link;
			}
		}

		const link = {
			obj,
			objName: obj.name,
			id,
			label,
			onComplete: [],
			onClear: [].concat(onClear || [])
		};

		if (labelCache) {
			this._clear({name, clearFn, label, group, join, replacedBy: link});
		}

		links.set(id, link);
		label && (labels[label] = id);

		return id;
	}

	/**
	 * Clears the specified listeners
	 * @private
	 */
	_clear({name, clearFn, id, label, group}): this {
		// FIXME
		return;

		const
			p = arguments[0];

		let
			cache = this._initCache(name);

		if (group) {
			if (Object.isRegExp(group)) {
				$C(cache.groups).forEach((g) => group.test(g) && this._clear({...p, group: g}));
				return this;
			}

			if (!cache.groups[group]) {
				return this;
			}

			cache = cache.groups[group];

		} else {
			cache = cache.root;
		}

		const
			{labels, links} = cache;

		if (label) {
			const
				tmp = labels[label];

			if (id != null && id !== tmp) {
				return this;
			}

			id = tmp;
		}

		if (id != null) {
			const
				link = links.get(id);

			if (link) {
				links.delete(link.id);
				delete labels[link.label];

				const ctx = {
					...p,
					link,
					type: 'clear'
				};

				const
					clearHandlers = link.onClear;

				for (let i = 0; i < clearHandlers.length; i++) {
					clearHandlers[i].call(this.context || this, ctx);
				}

				if (clearFn) {
					clearFn(link.id, ctx);
				}
			}

		} else {
			const
				values = links.values();

			for (let el = values.next(); !el.done; el = values.next()) {
				this._clear({...p, id: el.value.id});
			}
		}

		return this;
	}

	/**
	 * Clears all listeners
	 * @private
	 */
	_clearAll({name, clearFn}): this {
		/* eslint-disable prefer-spread */
		this._clear.apply(this, arguments);
		/* eslint-enable prefer-spread */

		const
			obj = this._initCache(name).groups,
			keys = Object.keys(obj);

		for (let i = 0; i < keys.length; i++) {
			this._clear({name, clearFn, group: keys[i]});
		}

		return this;
	}
}
