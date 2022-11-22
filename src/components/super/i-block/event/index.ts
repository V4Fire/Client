/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/super/i-block/event/README.md]]
 * @packageDocumentation
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

import { system, hook, watch } from 'components/super/i-block/decorators';
import { initGlobalListeners } from 'components/super/i-block/modules/listeners';

import type iBlock from 'components/super/i-block';
import type { ComponentEvent, CallChild } from 'components/super/i-block/interface';

import iBlockBase from 'components/super/i-block/base';

const
	$$ = symbolGenerator();

@component()
export default abstract class iBlockEvent extends iBlockBase {
	/**
	 * The component event emitter.
	 * In fact, component methods such as `on` or `off` are just aliases to the methods of the given emitter.
	 *
	 * All events fired by this emitter can be listened to "outside" using the `v-on` directive.
	 * Also, if the component is in `dispatching` mode, then the emitted events will start bubbling up to
	 * the parent component.
	 *
	 * In addition, all emitted events are automatically logged using the `log` method.
	 * The default logging level is `info` (logging requires the `verbose` prop to be set to true),
	 * but you can set the logging level explicitly.
	 *
	 * Note that `selfEmitter.emit` always fires two events:
	 *
	 * 1. `${event}`(self, ...args) - the first argument is passed as a link to the component that emitted the event
	 * 2. `on-${event}`(...args)
	 *
	 * Note that to detach a listener, you can specify not only a link to the listener, but also the name of
	 * the group/label to which the listener is attached. By default, all listeners have a group name equal to
	 * the event name being listened to. If nothing is specified, then all component event listeners will be detached.
	 *
	 * @example
	 * ```js
	 * this.selfEmitter.on('example', console.log, {group: 'example'});   // [this, 42]
	 * this.selfEmitter.on('onExample', console.log, {group: 'example'}); // [42]
	 * this.selfEmitter.emit('example', 42);
	 * this.selfEmitter.off({group: 'example'});
	 * ```
	 */
	@system({
		atom: true,
		unique: true,
		init: (o, d) => (<Async>d.async).wrapEventEmitter({
			on: (event, handler) => o.$on(normalizeEventName(event), handler),
			once: (event, handler) => o.$once(normalizeEventName(event), handler),
			off: o.$off.bind(o),
			emit: o.emit.bind(o)
		})
	})

	protected readonly selfEmitter!: EventEmitterWrapper<this>;

	/**
	 * The component local event emitter.
	 *
	 * Unlike `selfEmitter`, events that are fired by this emitter cannot be caught "outside" with the `v-on` directive,
	 * and these events do not bubble up. Also, such events can be listened to by a wildcard mask.
	 *
	 * Note that to detach a listener, you can specify not only a link to the listener, but also the name of
	 * the group/label to which the listener is attached. By default, all listeners have a group name equal to
	 * the event name being listened to. If nothing is specified, then all component event listeners will be detached.
	 *
	 * @example
	 * ```js
	 * this.localEmitter.on('example.*', console.log);
	 * this.localEmitter.emit('example.a', 1);
	 * this.localEmitter.emit('example.b', 2);
	 * this.localEmitter.off({group: 'example.*'});
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
	 * Note that to detach a listener, you can specify a group/label name to which the listener is bound.
	 * By default, all listeners have a group name equal to the event name being listened to.
	 * If nothing is specified, then all component event listeners will be detached.
	 *
	 * @example
	 * ```js
	 * this.parentEmitter.on('example', console.log, {group: 'myEvent'});
	 * this.$parent.emit('example', 1);
	 * this.parentEmitter.off({group: 'myEvent'});
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
	 * Note that to detach a listener, you can specify not only a link to the listener, but also the name of
	 * the group/label to which the listener is attached. By default, all listeners have a group name equal to
	 * the event name being listened to. If nothing is specified, then all component event listeners will be detached.
	 *
	 * @example
	 * ```js
	 * this.rootEmitter.on('example', console.log, {group: 'myEvent'});
	 * this.$root.emit('example', 1);
	 * this.parentEmitter.off({group: 'myEvent'});
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

	protected readonly rootEmitter!: ReadonlyEventEmitterWrapper<this>;

	/**
	 * The global event emitter located in `core/component/event`.
	 *
	 * This emitter should be used to listen for external events, such as events coming over a WebSocket connection, etc.
	 * Also, such events can be listened to by a wildcard mask. To avoid memory leaks, only this emitter is used to listen
	 * for global events.
	 *
	 * Note that to detach a listener, you can specify not only a link to the listener, but also the name of
	 * the group/label to which the listener is attached. By default, all listeners have a group name equal to
	 * the event name being listened to. If nothing is specified, then all component event listeners will be detached.
	 *
	 * @see `core/component/event`
	 *
	 * ```js
	 * import { globalEmitter } from 'core/component';
	 *
	 * this.globalEmitter.on('example.*', console.log, {group: 'myEvent'});
	 *
	 * globalEmitter.emit('example.a', 1);
	 * globalEmitter.emit('example.b', 2);
	 *
	 * this.globalEmitter.off({group: 'myEvent'});
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
	on<E = unknown, R = unknown>(event: string, handler: ProxyCb<E, R, this>, opts?: AsyncOptions): object {
		return this.selfEmitter.on(event, handler, opts);
	}

	/**
	 * Attaches a disposable event listener to the specified component event
	 *
	 * @see [[Async.once]]
	 * @param event
	 * @param handler
	 * @param [opts] - additional options
	 */
	once<E = unknown, R = unknown>(event: string, handler: ProxyCb<E, R, this>, opts?: AsyncOptions): object {
		return this.selfEmitter.once(event, handler, opts);
	}

	/**
	 * Returns a promise that is resolved after emitting the specified component event
	 *
	 * @see [[Async.promisifyOnce]]
	 * @param event
	 * @param [opts] - additional options
	 */
	promisifyOnce<T = unknown>(event: string, opts?: AsyncOptions): Promise<CanUndef<T>> {
		return this.selfEmitter.promisifyOnce(event, opts);
	}

	/**
	 * Detaches an event listener from the component.
	 *
	 * Note that to detach a listener, you can specify not only a link to the listener, but also the name of
	 * the group/label to which the listener is attached. By default, all listeners have a group name equal to
	 * the event name being listened to. If nothing is specified, then all component event listeners will be detached.
	 *
	 * @see [[Async.off]]
	 * @param [opts] - additional options
	 *
	 * @example
	 * ```js
	 * const id = this.on('someEvent', console.log);
	 * this.off(id);
	 *
	 * this.on('someEvent', console.log);
	 * this.off({group: 'someEvent'});
	 *
	 * this.on('someEvent', console.log, {label: 'myLabel'});
	 * this.off({group: 'someEvent'});
	 *
	 * // Detach all listeners
	 * this.off();
	 * ```
	 */
	off(opts?: ClearOptionsId<EventId>): void {
		this.selfEmitter.off(opts);
	}

	/**
	 * Emits a component event.
	 * The event name is converted to camelCase. In simple terms, `foo-bar` and `fooBar` will end up being the same event.
	 *
	 * All events fired by this method can be listened to "outside" using the `v-on` directive.
	 * Also, if the component is in `dispatching` mode, then this event will start bubbling up to the parent component.
	 *
	 * In addition, all emitted events are automatically logged using the `log` method.
	 * The default logging level is `info` (logging requires the `verbose` prop to be set to true),
	 * but you can set the logging level explicitly.
	 *
	 * Note that this method always fires two events:
	 *
	 * 1. `${event}`(self, ...args) - the first argument is passed as a link to the component that emitted the event
	 * 2. `on-${event}`(...args)
	 *
	 * @param event - the event name to dispatch
	 * @param args - the event arguments
	 *
	 * @example
	 * ```js
	 * this.on('someEvent', console.log);   // [this, 42]
	 * this.on('onSomeEvent', console.log); // [42]
	 *
	 * this.emit('someEvent', 42);
	 *
	 * // Enable logging
	 * setEnv('log', {patterns: ['event:']});
	 * this.emit({event: 'someEvent', logLevel: 'warn'}, 42);
	 * ```
	 */
	emit(event: string | ComponentEvent, ...args: unknown[]): void {
		const
			eventDecl = normalizeEvent(event),
			eventName = eventDecl.event;

		this.$emit(eventName, this, ...args);
		this.$emit(getWrappedEventName(eventName), ...args);

		if (this.dispatching) {
			this.dispatch(eventDecl, ...args);
		}

		const
			logArgs = args.slice();

		if (eventDecl.logLevel === 'error') {
			logArgs.forEach((el, i) => {
				if (Object.isFunction(el)) {
					logArgs[i] = () => el;
				}
			});
		}

		this.log({context: `event:${eventName}`, logLevel: eventDecl.logLevel}, this, ...logArgs);
	}

	/**
	 * Emits a component event with the `error` logging level.
	 * All event parameters that are functions are passed to the logger "as is".
	 * The event name is converted to camelCase. In simple terms, `foo-bar` and `fooBar` will end up being the same event.
	 *
	 * All events fired by this method can be listened to "outside" using the `v-on` directive.
	 * Also, if the component is in `dispatching` mode, then this event will start bubbling up to the parent component.
	 *
	 * Note that this method always fires two events:
	 *
	 * 1. `${event}`(self, ...args) - the first argument is passed as a link to the component that emitted the event
	 * 2. `on-${event}`(...args)
	 *
	 * @param event - the event name to dispatch
	 * @param args - the event arguments
	 *
	 * @example
	 * ```js
	 * this.on('someEvent', console.log);   // [this, 42]
	 * this.on('onSomeEvent', console.log); // [42]
	 *
	 * // Enable logging
	 * setEnv('log', {patterns: ['event:']});
	 * this.emitError('someEvent', 42);
	 * ```
	 */
	emitError(event: string, ...args: unknown[]): void {
		this.emit({event, logLevel: 'error'}, ...args);
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
	 * In addition, all emitted events are automatically logged using the `log` method.
	 * The default logging level is `info` (logging requires the `verbose` prop to be set to true),
	 * but you can set the logging level explicitly.
	 *
	 * @param event - the event name to dispatch
	 * @param args - the event arguments
	 */
	dispatch(event: string | ComponentEvent, ...args: unknown[]): void {
		const
			that = this;

		const
			eventDecl = normalizeEvent(event);

		const
			eventName = eventDecl.event,
			wrappedEventName = getWrappedEventName(eventName);

		let {
			globalName,
			componentName,
			$parent: parent
		} = this;

		const
			logArgs = args.slice();

		if (eventDecl.logLevel === 'error') {
			logArgs.forEach((el, i) => {
				if (Object.isFunction(el)) {
					logArgs[i] = () => el;
				}
			});
		}

		while (parent != null) {
			if (parent.selfDispatching && parent.canSelfDispatchEvent(eventName)) {
				parent.$emit(eventName, this, ...args);
				parent.$emit(wrappedEventName, ...args);
				logFromParent(parent, `event:${eventName}`);

			} else {
				parent.$emit(normalizeEventName(`${componentName}::${eventName}`), this, ...args);
				parent.$emit(normalizeEventName(`${componentName}::${wrappedEventName}`), ...args);
				logFromParent(parent, `event:${componentName}::${eventName}`);

				if (globalName != null) {
					parent.$emit(normalizeEventName(`${globalName}::${eventName}`), this, ...args);
					parent.$emit(normalizeEventName(`${globalName}::${wrappedEventName}`), ...args);
					logFromParent(parent, `event:${globalName}::${eventName}`);
				}
			}

			if (!parent.dispatching) {
				break;
			}

			parent = parent.$parent;
		}

		function logFromParent(parent: iBlockEvent, context: string) {
			parent.log({context, logLevel: eventDecl.logLevel}, that, ...logArgs);
		}
	}

	/**
	 * Returns true if the specified event can be dispatched as the component own event (`selfDispatching`)
	 * @param event
	 */
	canSelfDispatchEvent(event: string): boolean {
		return !/^component-(?:status|hook)(?::\w+(-\w+)*|-change)$/.test(event.dasherize());
	}

	/**
	 * Waits until the specified template reference won't be available and returns it.
	 * The method returns a promise.
	 *
	 * @see [[Async.wait]]
	 * @see https://vuejs.org/guide/essentials/template-refs.html
	 *
	 * @param ref - the reference name
	 * @param [opts] - additional options
	 *
	 * @example
	 * __b-example.ts__
	 *
	 * ```typescript
	 * import iBlock, { component } from 'components/super/i-block/i-block';
	 *
	 * @component()
	 * export default class bExample extends iBlock {
	 *   override $refs!: {myInput: HTMLInputElement};
	 *
	 *   created() {
	 *     this.waitRef('myInput').then((myInput) => {
	 *       console.log(myInput.value);
	 *     });
	 *   }
	 * }
	 * ```
	 *
	 * __b-example.ss__
	 *
	 * ```
	 * - namespace [%fileName%]
	 *
	 * - include 'components/super/i-block'|b as placeholder
	 *
	 * - template index() extends ['i-block'].index
	 *   - block body
	 *     < input ref = myInput
	 * ```
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
		if (Object.isTruly(e.if(this))) {
			e.then(this);
		}
	}
}

function normalizeEvent(event: ComponentEvent | string): ComponentEvent {
	if (Object.isString(event)) {
		return {
			event: normalizeEventName(event),
			logLevel: 'info'
		};
	}

	return {
		...event,
		event: normalizeEventName(event.event)
	};
}

function getWrappedEventName(event: string): string {
	return normalizeEventName(`on-${event}`);
}

function normalizeEventName(event: string): string {
	return event.camelize(false);
}
