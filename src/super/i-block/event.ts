/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import { EventEmitter2 as EventEmitter } from 'eventemitter2';

import SyncPromise from 'core/promise/sync';
import type Async from 'core/async';

import type {

	ProxyCb,
	AsyncOptions,

	EventId,
	ClearOptionsId,

	EventEmitterWrapper,
	ReadonlyEventEmitterWrapper

} from 'core/async';

import { component, globalEmitter } from 'core/component';

import { system, hook, watch } from 'super/i-block/modules/decorators';
import { initGlobalListeners } from 'super/i-block/modules/listeners';

import type iBlock from 'super/i-block';
import type { ComponentEvent, CallChild } from 'super/i-block/interface';

import iBlockBase from 'super/i-block/base';

export const
	$$ = symbolGenerator();

@component()
export default abstract class iBlockEvent extends iBlockBase {
	override readonly Component!: iBlockEvent;

	/**
	 * The component event emitter.
	 * All events fired by this emitter can be listened to "outside" with the `v-on` directive.
	 * Also, these events can bubble up the component hierarchy.
	 *
	 * @example
	 * ```js
	 * this.selfEmitter.on('example', console.log);
	 * this.selfEmitter.emit('example');
	 * ```
	 */
	@system({
		atom: true,
		unique: true,
		init: (o, d) => (<Async>d.async).wrapEventEmitter({
			on: o.$on.bind(o),
			once: o.$once.bind(o),
			off: o.$off.bind(o)
		})
	})

	protected readonly selfEmitter!: EventEmitterWrapper<this>;

	/**
	 * The component local event emitter.
	 * Unlike `selfEmitter`, events that are fired by this emitter cannot be caught "outside" with the `v-on` directive,
	 * and these events do not bubble up. Also, such events can be listened to by a wildcard mask.
	 *
	 * @example
	 * ```js
	 * this.localEmitter.on('example.*', console.log);
	 * this.localEmitter.emit('example.a', 1);
	 * this.localEmitter.emit('example.b', 2);
	 * ```
	 */
	@system({
		atom: true,
		unique: true,
		init: (o, d) => (<Async>d.async).wrapEventEmitter(new EventEmitter({
			maxListeners: 1e3,
			newListener: false,
			wildcard: true
		}), {group: ':suspend'})
	})

	protected readonly localEmitter!: EventEmitterWrapper<this>;

	/**
	 * The parent component event emitter.
	 * To avoid memory leaks, only this emitter is used to listen for parent events.
	 *
	 * @example
	 * ```js
	 * this.parentEmitter.on('example', console.log);
	 * this.$parent.emit('example', 1);
	 * ```
	 */
	@system({
		atom: true,
		unique: true,
		init: (o, d) => (<Async>d.async).wrapEventEmitter({
			get on() {
				return o.$parent?.unsafe.$on.bind(o.$parent) ?? (() => Object.throw());
			},

			get once() {
				return o.$parent?.unsafe.$once.bind(o.$parent) ?? (() => Object.throw());
			},

			get off() {
				return o.$parent?.unsafe.$off.bind(o.$parent) ?? (() => Object.throw());
			}
		})
	})

	protected readonly parentEmitter!: ReadonlyEventEmitterWrapper<this>;

	/**
	 * The root component event emitter.
	 * To avoid memory leaks, only this emitter is used to listen for root events.
	 *
	 * @example
	 * ```js
	 * this.rootEmitter.on('example', console.log);
	 * this.$root.emit('example', 1);
	 * ```
	 */
	@system({
		atom: true,
		unique: true,
		init: (o, d) => (<Async>d.async).wrapEventEmitter({
			on: o.$root.unsafe.$on.bind(o.$root),
			once: o.$root.unsafe.$once.bind(o.$root),
			off: o.$root.unsafe.$off.bind(o.$root)
		})
	})

	protected readonly rootEmitter!: EventEmitterWrapper<this>;

	/**
	 * The global event emitter located in `core/component/event`.
	 * This emitter should be used to listen for external events, such as events coming over a WebSocket connection, etc.
	 * Also, such events can be listened to by a wildcard mask. To avoid memory leaks, only this emitter is used to listen
	 * for global events.
	 *
	 * @see `core/component/event`
	 *
	 * ```js
	 * this.globalEmitter.on('example.*', console.log);
	 * ```
	 */
	@system({
		atom: true,
		unique: true,
		init: (o, d) => (<Async>d.async).wrapEventEmitter(globalEmitter)
	})

	protected readonly globalEmitter!: EventEmitterWrapper<this>;

	/**
	 * Attaches an event listener to the specified component event
	 *
	 * @see [[Async.on]]
	 * @param event
	 * @param handler
	 * @param [opts] - additional options
	 */
	on<E = unknown, R = unknown>(event: string, handler: ProxyCb<E, R, this>, opts?: AsyncOptions): void {
		this.selfEmitter.on(event.dasherize(), handler, opts);
	}

	/**
	 * Attaches a disposable event listener to the specified component event
	 *
	 * @see [[Async.once]]
	 * @param event
	 * @param handler
	 * @param [opts] - additional options
	 */
	once<E = unknown, R = unknown>(event: string, handler: ProxyCb<E, R, this>, opts?: AsyncOptions): void {
		this.selfEmitter.once(event.dasherize(), handler, opts);
	}

	/**
	 * Returns a promise that is resolved after emitting the specified component event
	 *
	 * @see [[Async.promisifyOnce]]
	 * @param event
	 * @param [opts] - additional options
	 */
	promisifyOnce<T = unknown>(event: string, opts?: AsyncOptions): Promise<CanUndef<T>> {
		return this.selfEmitter.promisifyOnce(event.dasherize(), opts);
	}

	/**
	 * Detaches an event listeners from the component
	 *
	 * @see [[Async.off]]
	 * @param [opts] - additional options
	 */
	off(opts?: ClearOptionsId<EventId>): void {
		this.selfEmitter.off(opts);
	}

	/**
	 * Returns true if the specified event can be dispatched as a component own event (`selfDispatching`)
	 * @param event
	 */
	canSelfDispatchEvent(event: string): boolean {
		return !/^component-(?:status|hook)(?::\w+(-\w+)*|-change)$/.test(event);
	}

	/**
	 * Emits a component event.
	 * Note that this method always fires two events:
	 *
	 * 1. `${event}`(self, ...args)
	 * 2. `on-${event}`(...args)
	 *
	 * @param event - the event name to dispatch
	 * @param args - the event arguments
	 */
	emit(event: string | ComponentEvent, ...args: unknown[]): void {
		const
			eventDecl = Object.isString(event) ? {event} : event,
			eventName = eventDecl.event.camelize(false);

		eventDecl.event = eventName;

		this.$emit(eventName, this, ...args);
		this.$emit(`on-${eventName}`.camelize(false), ...args);

		if (this.dispatching) {
			this.dispatch(eventDecl, ...args);
		}

		const
			logArgs = args.slice();

		if (eventDecl.type === 'error') {
			logArgs.forEach((el, i) => {
				if (Object.isFunction(el)) {
					logArgs[i] = () => el;
				}
			});
		}

		this.log(`event:${eventName}`, this, ...logArgs);
	}

	/**
	 * Emits a component error event
	 *
	 * @param event - the event name to dispatch
	 * @param args - the event arguments
	 */
	emitError(event: string, ...args: unknown[]): void {
		this.emit({event, type: 'error'}, ...args);
	}

	/**
	 * Emits a component event to the parent component.
	 *
	 * This means that all component events will bubble up to the parent component:
	 * if the parent also has the `dispatching` property set to true, then events will bubble up to the next
	 * (from the hierarchy) parent component.
	 *
	 * All dispatched events have special prefixes to avoid collisions with events from other components.
	 * For example: bButton `click` will bubble up as `b-button::click`.
	 * Or if the component has the `globalName` prop, it will additionally bubble up as `${globalName}::click`.
	 *
	 * @param event - the event name to dispatch
	 * @param args - the event arguments
	 */
	dispatch(event: string | ComponentEvent, ...args: unknown[]): void {
		const
			eventDecl = Object.isString(event) ? {event} : event,
			eventName = eventDecl.event.camelize(false);

		eventDecl.event = eventName;

		let {
			componentName,
			$parent: parent
		} = this;

		const
			globalName = (this.globalName ?? '').camelize(false),
			logArgs = args.slice();

		if (eventDecl.type === 'error') {
			logArgs.forEach((el, i) => {
				if (Object.isFunction(el)) {
					logArgs[i] = () => el;
				}
			});
		}

		while (parent != null) {
			if (parent.selfDispatching && parent.canSelfDispatchEvent(eventName)) {
				parent.$emit(eventName, this, ...args);
				parent.$emit(`on-${eventName}`, ...args);
				parent.log(`event:${eventName}`, this, ...logArgs);

			} else {
				parent.$emit(`${componentName}::${eventName}`, this, ...args);
				parent.$emit(`${componentName}::on-${eventName}`, ...args);
				parent.log(`event:${componentName}::${eventName}`, this, ...logArgs);

				if (globalName !== '') {
					parent.$emit(`${globalName}::${eventName}`, this, ...args);
					parent.$emit(`${globalName}::on-${eventName}`, ...args);
					parent.log(`event:${globalName}::${eventName}`, this, ...logArgs);
				}
			}

			if (!parent.dispatching) {
				break;
			}

			parent = parent.$parent;
		}
	}

	/**
	 * Waits until the specified reference won't be available and returns it.
	 * The method returns a promise.
	 *
	 * @see [[Async.wait]]
	 * @param ref - the reference name
	 * @param [opts] - additional options
	 */
	protected waitRef<T = CanArray<iBlock | Element>>(ref: string, opts?: AsyncOptions): Promise<T> {
		let
			that = <iBlock>this;

		if (this.isFunctional) {
			ref += `:${this.componentId}`;
			that = this.$normalParent ?? that;
		}

		const
			refVal = that.$refs[ref];

		return this.async.promise<T>(() => new SyncPromise((resolve) => {
			if (refVal != null && (!Object.isArray(refVal) || refVal.length > 0)) {
				resolve(<T>refVal);

			} else {
				this.once(`[[REF:${ref}]]`, resolve, opts);
			}
		}), opts);
	}

	/**
	 * Initializes the global event listeners
	 * @param [resetListener]
	 */
	@hook({created: {functional: false}})
	protected initGlobalEvents(resetListener?: boolean): void {
		initGlobalListeners(Object.cast(this), resetListener);
	}

	@hook({beforeRuntime: {functional: false}})
	protected override initBaseAPI(): void {
		super.initBaseAPI();

		const
			i = this.instance;

		this.on = i.on.bind(this);
		this.once = i.once.bind(this);
		this.off = i.off.bind(this);
		this.emit = i.emit.bind(this);
	}

	/**
	 * Initializes the parent `callChild` event listener.
	 * It is used to provide general functionality for proxy calls from the parent.
	 */
	@watch({path: 'proxyCall', immediate: true})
	protected initCallChildListener(value: boolean): void {
		const label = {label: $$.initCallChildListener};
		this.parentEmitter.off(label);

		if (!value) {
			return;
		}

		this.parentEmitter.on('onCallChild', this.onCallChild.bind(this), label);
	}

	/**
	 * Handler: the `callChild` event occurred in the parent component
	 * @param e
	 */
	protected onCallChild(e: CallChild<this>): void {
		if (
			e.check[0] !== 'instanceOf' && e.check[1] === this[e.check[0]] ||
			e.check[0] === 'instanceOf' && this.instance instanceof <Function>e.check[1]
		) {
			return e.action.call(this);
		}
	}
}
