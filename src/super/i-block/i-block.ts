/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Async from 'core/async';
import { EventEmitter2 as EventEmitter } from 'eventemitter2';
import { prop, field, system, Vue } from 'core/component';
import { queue, backQueue } from 'core/render';

import * as helpers from 'core/helpers';
import * as browser from 'core/const/browser';
export type Classes = Dictionary<string | Array<string | true> | true>;

export default class iBlock extends Vue {
	/**
	 * Block unique id
	 */
	@system(() => `uid-${Math.random().toString().slice(2)}`)
	blockId!: string;

	/**
	 * Block unique name
	 */
	@prop({type: String, required: false})
	blockName!: string | undefined;

	/**
	 * Initial block modifiers
	 */
	@prop(Object)
	modsProp: Dictionary<string | number | boolean> = {};

	/**
	 * Initial block stage
	 */
	@prop({type: String, required: false})
	stageProp!: string | undefined;

	/**
	 * Dispatching mode
	 */
	@prop(Boolean)
	dispatching: boolean = false;

	/**
	 * If true, then the block will be reinitialized after activated
	 */
	@prop(Boolean)
	needReInit: boolean = false;

	/**
	 * Additional classes for block elements
	 */
	@prop(Object)
	classes: Classes = {};

	/**
	 * Advanced block parameters
	 */
	@prop(Object)
	p: Dictionary = {};

	/**
	 * Alias for $options.selfName
	 */
	@system()
	componentName!: string;

	/**
	 * Cache of ifOnce
	 */
	@field()
	protected ifOnceStore: Dictionary = {};

	/**
	 * Temporary cache
	 */
	@field()
	protected tmp: Dictionary = {};

	/**
	 * Temporary render cache
	 */
	@field()
	protected renderTmp: Dictionary = {};

	/**
	 * Link to the current Vue component
	 */
	@system((ctx) => ctx)
	protected self!: iBlock;

	/**
	 * API for async operations
	 */
	@system((ctx) => new Async(ctx))
	protected async!: Async<iBlock>;

	/**
	 * Local event emitter
	 */
	@system(() => new EventEmitter({maxListeners: 100, wildcard: true}))
	protected localEvent!: EventEmitter;

	/**
	 * Async loading state
	 */
	@field()
	protected asyncLoading: boolean = false;

	/**
	 * Counter of async components
	 */
	@field()
	protected asyncCounter: number = 0;

	/**
	 * Queue of async components
	 */
	@system(() => new Set())
	protected asyncQueue!: Set<Function>;

	/**
	 * Cache of child async components
	 */
	@field()
	protected asyncComponents: Dictionary<string> = {};

	/**
	 * Cache of child background async components
	 */
	@field()
	protected asyncBackComponents: Dictionary<string> = {};

	/**
	 * Some helpers
	 */
	@system(() => helpers)
	protected h!: typeof helpers;

	/**
	 * Browser constants
	 */
	@system(() => browser)
	protected b!: typeof browser;

	/**
	 * Link to console API
	 */
	@system(() => console)
	protected console!: Console;

	/**
	 * Link to window.location
	 */
	@system(() => location)
	protected location!: Location;

	/**
	 * Returns a string id, which is connected to the block
	 * @param id - custom id
	 */
	getConnectedId(id: string | void): string | undefined {
		if (!id) {
			return undefined;
		}

		return `${this.blockId}-${id}`;
	}

	/**
	 * Wrapper for $on
	 *
	 * @param event
	 * @param cb
	 */
	on(event: string, cb: Function): void {
		this.$on(event.dasherize(), cb);
	}

	/**
	 * Wrapper for $once
	 *
	 * @param event
	 * @param cb
	 */
	once(event: string, cb: Function): void {
		this.$once(event.dasherize(), cb);
	}

	/**
	 * Wrapper for $off
	 *
	 * @param [event]
	 * @param [cb]
	 */
	off(event?: string, cb?: Function): void {
		this.$off(event && event.dasherize(), cb);
	}

	/**
	 * Adds a component to the render queue
	 * @param id - task id
	 */
	protected regAsyncComponent(id: string): string {
		if (!this.asyncComponents[id]) {
			this.asyncLoading = true;
			const fn = this.async.proxy(() => {
				this.asyncCounter++;
				this.asyncQueue.delete(fn);
				this.$set(this.asyncComponents, id, true);
			}, {group: 'asyncComponents'});

			this.asyncQueue.add(fn);
			queue.add(fn);
		}

		return id;
	}

	/**
	 * Adds a component to the background render queue
	 * @param id - task id
	 */
	protected regAsyncBackComponent(id: string): string {
		if (!this.asyncBackComponents[id]) {
			const fn = this.async.proxy(() => {
				this.asyncCounter++;
				this.asyncQueue.delete(fn);
				this.$set(this.asyncBackComponents, id, true);
			}, {group: 'asyncBackComponents'});

			this.asyncQueue.add(fn);
			backQueue.add(fn);
		}

		return id;
	}

	/**
	 * Wrapper for $emit
	 *
	 * @param event
	 * @param args
	 */
	protected emit(event: string, ...args: any[]): void {
		event = event.dasherize();
		this.$emit(event, this, ...args);
		this.$emit(`on-${event}`, ...args);
		this.dispatching && this.dispatch(event, ...args);
	}

	/**
	 * Emits the specified event for the parent block
	 *
	 * @param event
	 * @param args
	 */
	protected dispatch(event: string, ...args: any[]): void {
		event = event.dasherize();

		let
			obj = this.$parent;

		while (obj) {
			obj.$emit(`${this.componentName}::${event}`, this, ...args);

			if (this.blockName) {
				obj.$emit(`${this.blockName.dasherize()}::${event}`, this, ...args);
			}

			/*if (!obj.dispatching) {
				break;
			}*/

			obj = obj.$parent;
		}
	}

	/**
	 * Returns an object with classes for elements of an another component
	 * @param classes - additional classes ({baseElementName: newElementName})
	 */
	protected provideClasses(classes?: Classes): Dictionary<string> {
		const
			map = {};

		if (classes) {
			const
				keys = Object.keys(classes);

			for (let i = 0; i < keys.length; i++) {
				const
					key = keys[i];

				let
					el = classes[key];

				if (el === true) {
					el = key;

				} else if (Object.isArray(el)) {
					el = el.slice();
					for (let i = 0; i < el.length; i++) {
						if (el[i] === true) {
							el[i] = key;
						}
					}
				}

				/*map[key] = this.getFullElName.apply(this, [].concat(el));*/
			}
		}

		return map;
	}
}
