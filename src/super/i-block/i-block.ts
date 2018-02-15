/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Vue from 'vue';
import '@v4fire/core/core';

document.addEventListener('DOMContentLoaded', () =>
	new Vue(<any>{
		data: {},
		el: document.getElementById('bla'),
		render(el: any): any {
			return el('i-block');
		}
	})
);

import Async from 'core/async';
import Block, { statuses } from 'core/block';
import { EventEmitter2 as EventEmitter } from 'eventemitter2';
import { component, prop, field, system, hook, ModsDecl, VueInterface } from 'core/component';
import { queue, backQueue } from 'core/render';

import * as helpers from 'core/helpers';
import * as browser from 'core/const/browser';
export type Classes = Dictionary<string | Array<string | true> | true>;

const
	$C = require('collection.js');

@component()
export default class iBlock extends VueInterface<iBlock> {
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
	 * Block initialize status
	 */
	@field()
	blockStatus: number = statuses.unloaded;

	/**
	 * Block modifiers
	 */
	static mods: ModsDecl = {
		theme: [
			['default']
		],

		size: [
			'xxs',
			'xs',
			's',
			['m'],
			'xs',
			'xxs'
		],

		progress: [
			'true',
			['false']
		],

		disabled: [
			'true',
			['false']
		],

		focused: [
			'true',
			['false']
		],

		hidden: [
			'true',
			['false']
		],

		width: [
			['normal'],
			'full',
			'auto'
		]
	};

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
	 * Cache for prop/field links
	 */
	@system(() => Object.createDict())
	private linkCache!: Dictionary<Dictionary>;

	/**
	 * Cache for prop/field links
	 */
	@system(() => Object.createDict())
	private syncLinkCache!: Dictionary<Function>;

	render(el: any): any {
		return el('span', '121');
	}

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
	 * Initializes core block API
	 */
	@hook('beforeCreate')
	protected initBaseAPI() {
		this.link = this.instance.link.bind(this);
		this.createWatchObject = this.instance.createWatchObject.bind(this);
		this.execCbAfterCreated = this.instance.execCbAfterCreated.bind(this);
	}

	/**
	 * Sets a new watch property to the specified object
	 *
	 * @param path - path to the property (bla.baz.foo)
	 * @param value
	 * @param [obj]
	 */
	protected setField(path: string, value: any, obj: Object = this): any {
		let
			ref = obj;

		const
			chunks = path.split('.');

		for (let i = 0; i < chunks.length; i++) {
			const
				prop = chunks[i];

			if (chunks.length === i + 1) {
				path = prop;
				continue;
			}

			if (!ref[prop] || typeof ref[prop] !== 'object') {
				this.$set(ref, prop, isNaN(Number(chunks[i + 1])) ? {} : []);
			}

			ref = ref[prop];
		}

		if (path in ref) {
			ref[path] = value;

		} else {
			this.$set(ref, path, value);
		}

		return value;
	}

	/**
	 * Deletes a watch property from the specified object
	 *
	 * @param path - path to the property (bla.baz.foo)
	 * @param [obj]
	 */
	protected deleteField(path: string, obj: Object = this): boolean {
		let ref = obj;

		const
			chunks = path.split('.');

		let test = true;
		for (let i = 0; i < chunks.length; i++) {
			const
				prop = chunks[i];

			if (chunks.length === i + 1) {
				path = prop;
				continue;
			}

			if (!ref[prop] || typeof ref[prop] !== 'object') {
				test = false;
				break;
			}

			ref = ref[prop];
		}

		if (test) {
			this.$delete(ref, path);
			return true;
		}

		return false;
	}

	/**
	 * Returns a property from the specified object
	 *
	 * @param path - path to the property (bla.baz.foo)
	 * @param [obj]
	 */
	protected getField(path: string, obj: Object = this): any {
		const
			chunks = path.split('.');

		let res = obj;
		for (let i = 0; i < chunks.length; i++) {
			if (res == null) {
				return undefined;
			}

			res = res[chunks[i]];
		}

		return res;
	}

	/**
	 * Synchronizes block props values with store values
	 * @param [name] - property name
	 */
	protected syncLinks(name?: string): void {
		if (name) {
			this.syncLinkCache[name]();

		} else {
			$C(this.syncLinkCache).forEach((fn) => fn);
		}
	}

	/**
	 * Sets a link for the specified field
	 *
	 * @param field
	 * @param [wrapper]
	 * @param [watchParams]
	 */
	protected link(field: string, wrapper: (this: this) => any, watchParams: Object): any {
		const
			path = this.$activeField;

		if (!(path in this.linkCache)) {
			this.linkCache[path] = {};
			this.execCbAfterCreated(() => {
				this.$watch(field, (val) => {
					this.setField(path, wrapper ? wrapper.call(this, val) : val);
				}, watchParams);
			});

			const val = () => wrapper ? wrapper.call(this, this[field]) : this[field];
			this.syncLinkCache[field] = () => this.setField(path, val());
			return val();
		}
	}

	/**
	 * Creates an object with linked fields
	 *
	 * @param path - property path
	 * @param fields
	 * @param [watchParams]
	 */
	protected createWatchObject(
		path: string,
		fields: Array<string | [string] | [string, (this: this) => any] | [string, string, (this: this) => any]>,
		watchParams?: Object
	): Object {
		const
			{linkCache, syncLinkCache} = this;

		if (path) {
			path = [this.$activeField, path].join('.');

		} else {
			path = this.$activeField;
		}

		const
			short = path.split('.').slice(1),
			obj = {};

		if (short.length) {
			$C(obj).set({}, short);
		}

		const
			map = $C(obj).get(short);

		for (let i = 0; i < fields.length; i++) {
			const
				el = fields[i];

			if (Object.isArray(el)) {
				let
					wrapper,
					field;

				if (el.length === 3) {
					field = el[1];
					wrapper = el[2];

				} else if (Object.isFunction(el[1])) {
					field = el[0];
					wrapper = el[1];

				} else {
					field = el[1];
				}

				const
					l = [path, el[0]].join('.');

				if (!$C(linkCache).get(l)) {
					$C(linkCache).set(true, l);
					this.execCbAfterCreated(() => {
						this.$watch(field, (val) => {
							this.setField(l, wrapper ? wrapper.call(this, val) : val);
						}, watchParams);
					});

					const
						v = this.getField(field),
						val = () => wrapper ? wrapper.call(this, v) : v;

					syncLinkCache[field] = () => this.setField(l, val());
					map[el[0]] = val();
				}

			} else {
				const
					l = [path, el].join('.');

				if (!$C(linkCache).get(l)) {
					$C(linkCache).set(true, l);

					this.execCbAfterCreated(() => {
						this.$watch(el, (val) => this.setField(l, val), watchParams);
					});

					syncLinkCache[el] = () => this.setField(l, this.getField(el));
					map[el] = this.getField(el);
				}
			}
		}

		return obj;
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

			if (!obj.dispatching) {
				break;
			}

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

	/**
	 * Executes the specified callback after created hook
	 * @param cb
	 */
	private execCbAfterCreated(cb: Function): void {
		if (this.blockStatus) {
			cb();

		} else {
			this.meta.hooks.created.push({
				name: Math.random().toString(),
				fn: cb,
				after: new Set()
			});
		}
	}
}
