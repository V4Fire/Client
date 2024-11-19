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
import type { AsyncOptions, EventEmitterWrapper, ReadonlyEventEmitterWrapper, EventId } from 'core/async';

import { component, globalEmitter, ComponentEmitterOptions } from 'core/component';

import type { SetModEvent, ModEvent } from 'components/friends/block';

import { computed, hook, watch } from 'components/super/i-block/decorators';
import { initGlobalListeners } from 'components/super/i-block/modules/listeners';

import type iBlock from 'components/super/i-block/i-block';
import type { CallChild } from 'components/super/i-block/interface';

import iBlockBase from 'components/super/i-block/base';

import type { ComponentEvent, InferComponentEvents } from 'components/super/i-block/event/interface';

export * from 'components/super/i-block/event/interface';

const
	$$ = symbolGenerator();

@component({partial: 'iBlock'})
export default abstract class iBlockEvent extends iBlockBase {
	/**
	 * An associative type for typing events emitted by the component.
	 * Events are described using tuples, where the first element is the event name, and the rest are arguments.
	 */
	readonly SelfEmitter!: InferComponentEvents<[
		['error', ...unknown[]],
		[`mod:set:${string}`, SetModEvent],
		[`mod:set:${string}:${string}`, SetModEvent],
		[`mod:remove:${string}`, ModEvent]
	]>;

	/**
	 * An associative type for typing events emitted by the `localEmitter`.
	 * Events are described using tuples, where the first element is the event name, and the rest are arguments.
	 */
	readonly LocalEmitter!: {};

	/**
	 * The component event emitter.
	 * In fact, the component methods such as `on` or `off` are just aliases to the methods of the given emitter.
	 *
	 * All events fired by this emitter can be listened to "outside" using the `v-on` directive.
	 * Also, if the component is in the `dispatching` mode, then the emitted events will start bubbling up to
	 * the parent component.
	 *
	 * In addition, all emitted events are automatically logged using the `log` method.
	 * The default logging level is `info` (logging requires the `verbose` prop to be set to true),
	 * but you can set the logging level explicitly.
	 *
	 * Mind that `selfEmitter.emit` always fires three events:
	 *
	 * 1. `${event}`(self, ...args) - the first argument is passed as a link to the component that emitted the event.
	 * 2. `${event}:component`(self, ...args) - the event to avoid collisions between component events and
	 *    native DOM events.
	 *
	 * 3. `on-${event}`(...args)
	 *
	 * Note that to detach a listener, you can specify not only a link to the listener, but also the name of
	 * the group/label to which the listener is attached.
	 * By default, all listeners have a group name equal to the event name being listened to.
	 * If nothing is specified, then all component event listeners will be detached.
	 *
	 * @example
	 * ```js
	 * this.selfEmitter.on('example', console.log, {group: 'example'});   // [this, 42]
	 * this.selfEmitter.on('onExample', console.log, {group: 'example'}); // [42]
	 * this.selfEmitter.emit('example', 42);
	 * this.selfEmitter.off({group: 'example'});
	 * ```
	 */
	@computed({cache: 'forever'})
	get selfEmitter(): this['SelfEmitter'] & EventEmitterWrapper<this> {
		const emitter = this.async.wrapEventEmitter({
			on: (event: string, handler: Function, opts?: ComponentEmitterOptions) =>
				this.$on(normalizeEventName(event), handler, {...opts, rawEmitter: true}),

			once: (event: string, handler: Function, opts?: ComponentEmitterOptions) =>
				this.$once(normalizeEventName(event), handler, {...opts, rawEmitter: true}),

			off: (eventOrLink: string | EventId, handler: Function) => {
				if (Object.isString(eventOrLink)) {
					return this.$off(normalizeEventName(eventOrLink), handler);
				}

				return this.$off(eventOrLink);
			},

			emit: this.emit.bind(this),
			strictEmit: this.strictEmit.bind(this)
		});

		return Object.cast(emitter);
	}

	/**
	 * The component local event emitter.
	 *
	 * Unlike `selfEmitter`, events fired by this emitter cannot be caught "outside" with the `v-on` directive,
	 * and do not bubble up. Also, such events can be listened to by a wildcard mask.
	 *
	 * Note that to detach a listener, you can specify not only a link to the listener, but also the name of
	 * the group/label to which the listener is attached.
	 * By default, all listeners have a group name equal to the event name being listened to.
	 * If nothing is specified, then all component event listeners will be detached.
	 *
	 * @example
	 * ```js
	 * this.localEmitter.on('example.*', console.log);
	 * this.localEmitter.emit('example.a', 1);
	 * this.localEmitter.emit('example.b', 2);
	 * this.localEmitter.off({group: 'example.*'});
	 * ```
	 */
	@computed({cache: 'forever'})
	protected get localEmitter(): this['LocalEmitter'] & EventEmitterWrapper<this> {
		const emitter = this.async.wrapEventEmitter(new EventEmitter({
			maxListeners: 10e3,
			newListener: false,
			wildcard: true
		}), {group: ':suspend'});

		emitter['strictEmit'] = (event: string, ...args: unknown[]) => emitter.emit(event, ...args);
		return emitter;
	}

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
	@computed({cache: 'forever'})
	protected get parentEmitter(): ReadonlyEventEmitterWrapper<this> {
		const that = this;

		return this.async.wrapEventEmitter({
			get on() {
				const ee = that.$parent?.selfEmitter;
				return ee?.on.bind(ee) ?? (() => Object.throw());
			},

			get once() {
				const ee = that.$parent?.selfEmitter;
				return ee?.once.bind(ee) ?? (() => Object.throw());
			},

			get off() {
				const ee = that.$parent?.selfEmitter;
				return ee?.off.bind(ee) ?? (() => Object.throw());
			}
		});
	}

	/**
	 * The root component event emitter.
	 * To avoid memory leaks, only this emitter is used to listen for root events.
	 *
	 * Note that to detach a listener, you can specify not only a link to the listener, but also the name of
	 * the group/label to which the listener is attached.
	 * By default, all listeners have a group name equal to the event name being listened to.
	 * If nothing is specified, then all component event listeners will be detached.
	 *
	 * @example
	 * ```js
	 * this.rootEmitter.on('example', console.log, {group: 'myEvent'});
	 * this.r.emit('example', 1);
	 * this.parentEmitter.off({group: 'myEvent'});
	 * ```
	 */
	@computed({cache: 'forever'})
	protected get rootEmitter(): this['Root']['SelfEmitter'] & ReadonlyEventEmitterWrapper<this['Root']> {
		return this.async.wrapEventEmitter(this.r.unsafe.selfEmitter);
	}

	/**
	 * The global event emitter located in `core/component/event`.
	 *
	 * This emitter should be used to listen for external events, such as events coming over a WebSocket connection, etc.
	 * Also, such events can be listened to by a wildcard mask.
	 * To avoid memory leaks, only this emitter is used to listen for global events.
	 *
	 * Note that to detach a listener, you can specify not only a link to the listener, but also the name of
	 * the group/label to which the listener is attached.
	 * By default, all listeners have a group name equal to
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
	@computed({cache: 'forever'})
	protected get globalEmitter(): EventEmitterWrapper<this> {
		const emitter = this.async.wrapEventEmitter(globalEmitter);
		emitter['strictEmit'] = (event: string, ...args: unknown[]) => emitter.emit(event, ...args);
		return emitter;
	}

	/**
	 * Attaches an event listener to the specified component event
	 * {@link Async.on}
	 *
	 * @param event
	 * @param handler
	 * @param [opts] - additional options
	 */
	on: typeof this['selfEmitter']['on'] =
		function on(this: iBlockEvent, event: string, handler: Function, opts?: AsyncOptions): object {
			return this.selfEmitter.on(event, <any>handler, opts);
		};

	/**
	 * Attaches a disposable event listener to the specified component event
	 * {@link Async.once}
	 *
	 * @param event
	 * @param handler
	 * @param [opts] - additional options
	 */
	once: typeof this['selfEmitter']['once'] =
		function once(this: iBlockEvent, event: string, handler: Function, opts?: AsyncOptions): object {
			return this.selfEmitter.once(event, handler, opts);
		};

	/**
	 * Returns a promise that is resolved after emitting the specified component event
	 * {@link Async.promisifyOnce}
	 *
	 * @param event
	 * @param [opts] - additional options
	 */
	promisifyOnce: typeof this['selfEmitter']['promisifyOnce'] =
		function promisifyOnce(this: iBlockEvent, event: string, opts?: AsyncOptions): Promise<any> {
			return this.selfEmitter.promisifyOnce(event, opts);
		};

	/**
	 * Detaches an event listener from the component.
	 *
	 * Note that to detach a listener, you can specify not only a link to the listener, but also the name of
	 * the group/label to which the listener is attached.
	 * By default, all listeners have a group name equal to the event name being listened to.
	 * If nothing is specified, then all component event listeners will be detached.
	 * {@link Async.off}
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
	off: typeof this['selfEmitter']['off'] =
		function off(this: iBlockEvent, ...args: any[]): void {
			return this.selfEmitter.off(...args);
		};

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
	 * Note that this method always fires three events:
	 *
	 * 1. `${event}`(self, ...args) - the first argument is passed as a link to the component that emitted the event.
	 * 2. `${event}:component`(self, ...args) - the event to avoid collisions between component events and
	 *    native DOM events.
	 *
	 * 3. `on-${event}`(...args)
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
	emit: typeof this['selfEmitter']['emit'] =
		function emit(this: iBlockEvent, event: string | ComponentEvent, ...args: unknown[]): void {
			// @ts-ignore (cast)
			this.strictEmit(normalizeEvent(event), ...args);
		};

	/**
	 * Emits a component event.
	 *
	 * All events fired by this method can be listened to "outside" using the `v-on` directive.
	 * Also, if the component is in `dispatching` mode, then this event will start bubbling up to the parent component.
	 *
	 * In addition, all emitted events are automatically logged using the `log` method.
	 * The default logging level is `info` (logging requires the `verbose` prop to be set to true),
	 * but you can set the logging level explicitly.
	 *
	 * Note that this method always fires three events:
	 *
	 * 1. `${event}`(self, ...args) - the first argument is passed as a link to the component that emitted the event.
	 * 2. `${event}:component`(self, ...args) - the event to avoid collisions between component events and
	 *    native DOM events.
	 *
	 * 3. `on-${event}`(...args)
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
	strictEmit: typeof this['selfEmitter']['strictEmit'] =
		function strictEmit(this: iBlockEvent, event: string | ComponentEvent, ...args: any[]): void {
			const
				eventDecl = normalizeStrictEvent(event),
				eventName = eventDecl.event;

			this.$emit(eventName, this, ...args);
			this.$emit(getComponentEventName(eventName), this, ...args);
			this.$emit(getWrappedEventName(eventName), ...args);

			if (this.dispatching) {
				this.dispatch(event, ...args);
			}

			if (this.verbose || eventDecl.logLevel !== 'info') {
				const logArgs = args.slice();

				if (eventDecl.logLevel === 'error') {
					logArgs.forEach((el, i) => {
						if (Object.isFunction(el)) {
							logArgs[i] = () => el;
						}
					});
				}

				this.log({context: `event:${eventName}`, logLevel: eventDecl.logLevel}, this, ...logArgs);
			}
		};

	/**
	 * Emits a component event with the `error` logging level.
	 * All event parameters that are functions are passed to the logger "as is".
	 * The event name is converted to camelCase. In simple terms, `foo-bar` and `fooBar` will end up being the same event.
	 *
	 * All events fired by this method can be listened to "outside" using the `v-on` directive.
	 * Also, if the component is in `dispatching` mode, then this event will start bubbling up to the parent component.
	 *
	 * Note that this method always fires three events:
	 *
	 * 1. `${event}`(self, ...args) - the first argument is passed as a link to the component that emitted the event.
	 * 2. `${event}:component`(self, ...args) - the event to avoid collisions between component events and
	 *    native DOM events.
	 *
	 * 3. `on-${event}`(...args)
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
	emitError: typeof this['selfEmitter']['emit'] =
		function emitError(this: iBlockEvent, event: string | ComponentEvent, ...args: unknown[]): void {
			this.emit(Object.isString(event) ? {event, logLevel: 'error'} : {...event, logLevel: 'error'}, ...args);
		};

	/**
	 * Emits a component event to the parent component.
	 *
	 * This means that all component events will bubble up to the parent component.
	 * If the parent also has the `dispatching` property set to true, then events will bubble up to the next
	 * (from the hierarchy) parent component.
	 *
	 * All dispatched events have special prefixes to avoid collisions with events from other components.
	 * For example, bButton `click` will bubble up as `b-button::click`.
	 * Or if the component has the `globalName` prop, it will additionally bubble up as `${globalName}::click`.
	 *
	 * In addition, all emitted events are automatically logged using the `log` method.
	 * The default logging level is `info` (logging requires the `verbose` prop to be set to true),
	 * but you can set the logging level explicitly.
	 *
	 * @param event - the event name to dispatch
	 * @param args - the event arguments
	 */
	dispatch: typeof this['selfEmitter']['emit'] =
		function dispatch(this: iBlockEvent, event: string | ComponentEvent, ...args: unknown[]): void {
			const that = this;

			const eventDecl = normalizeStrictEvent(event);

			const
				eventName = eventDecl.event,
				wrappedEventName = getWrappedEventName(eventName);

			let {globalName, componentName, $parent: parent} = this;

			const
				log = this.verbose || eventDecl.logLevel !== 'info',
				logArgs = log ? args.slice() : args;

			if (log && eventDecl.logLevel === 'error') {
				logArgs.forEach((el, i) => {
					if (Object.isFunction(el)) {
						logArgs[i] = () => el;
					}
				});
			}

			while (parent != null) {
				if (parent.selfDispatching && parent.canSelfDispatchEvent(eventName)) {
					parent.$emit(eventName, this, ...args);
					parent.$emit(getComponentEventName(eventName), this, ...args);
					parent.$emit(wrappedEventName, ...args);

					if (log) {
						logFromParent(parent, `event:${eventName}`);
					}

				} else {
					parent.$emit(normalizeEventName(`${componentName}::${eventName}`), this, ...args);
					parent.$emit(normalizeEventName(`${componentName}::${wrappedEventName}`), ...args);

					if (log) {
						logFromParent(parent, `event:${componentName}::${eventName}`);
					}

					if (globalName != null) {
						parent.$emit(normalizeEventName(`${globalName}::${eventName}`), this, ...args);
						parent.$emit(normalizeEventName(`${globalName}::${wrappedEventName}`), ...args);

						if (log) {
							logFromParent(parent, `event:${componentName}::${eventName}`);
						}

						logFromParent(parent, `event:${globalName}::${eventName}`);
					}
				}

				if (!parent.dispatching) {
					break;
				}

				parent = parent.$parent;
			}

			function logFromParent(parent: iBlock, context: string) {
				parent.log({context, logLevel: eventDecl.logLevel}, that, ...logArgs);
			}
		};

	/**
	 * Returns true if the specified event can be dispatched as the component own event (`selfDispatching`)
	 * @param event
	 */
	canSelfDispatchEvent(event: string): boolean {
		return !/^(?:component-status|hook)(?::\w+(-\w+)*|-change)$/.test(event.dasherize());
	}

	/**
	 * Waits until the specified template reference won't be available and returns it.
	 * The method returns a promise.
	 * {@link Async.wait}
	 *
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
	 *   declare protected readonly $refs: iBlock['$refs'] & {
	 *     myInput: HTMLInputElement
	 *   };
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
		return this.async.promise<T>(() => new SyncPromise((resolve) => {
			const refVal = this.$refs[ref];

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

	protected override initBaseAPI(): void {
		super.initBaseAPI();

		const i = this.instance;

		this.on = i.on.bind(this);
		this.once = i.once.bind(this);
		this.promisifyOnce = i.promisifyOnce.bind(this);
		this.off = i.off.bind(this);
		this.emit = i.emit.bind(this);
		this.strictEmit = i.strictEmit.bind(this);
		this.emitError = i.emitError.bind(this);
		this.dispatch = i.dispatch.bind(this);
	}

	/**
	 * Initializes the parent `callChild` event listener.
	 * It is used to provide general functionality for proxy calls from the parent.
	 *
	 * @param enable
	 */
	@watch({
		path: 'proxyCall',
		immediate: true,
		shouldInit: (o) => o.proxyCall != null
	})

	protected initCallChildListener(enable: boolean): void {
		const label = {label: $$.initCallChildListener};
		this.parentEmitter.off(label);

		if (!enable) {
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

function normalizeEvent(event: ComponentEvent | string): string | ComponentEvent {
	if (Object.isString(event)) {
		return normalizeEventName(event);
	}

	return {
		logLevel: event.logLevel,
		event: normalizeEventName(event.event)
	};
}

function normalizeStrictEvent(event: ComponentEvent | string): ComponentEvent {
	if (Object.isString(event)) {
		return {event, logLevel: 'info'};
	}

	return event;
}

function getWrappedEventName(event: string): string {
	return `on${event[0].toUpperCase()}${event.slice(1)}`;
}

function getComponentEventName(event: string): string {
	return `${event}:component`;
}

function normalizeEventName(event: string): string {
	if (event.includes('-')) {
		return event.camelize(false);
	}

	return event;
}
