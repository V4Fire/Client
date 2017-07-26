'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Async from 'core/async';
import Store from 'core/store';
import Block, { statuses } from 'core/block';
import BlockConstructor from './modules/constructor';
import { queue, backQueue } from 'core/render';
import { component, staticComponents } from 'core/component';
import { delegate } from 'core/dom';
import { abstract, field, blockProp, params, wait, blockProps, binds, watchers, locals } from './modules/decorators';
import * as helpers from 'core/helpers';
import * as browser from 'core/const/browser';
import './modules/vue.directives';

const
	$C = require('collection.js'),
	EventEmitter2 = require('eventemitter2'),
	localforage = require('localforage'),
	uuid = require('uuid');

export { default as BlockConstructor, PARENT } from './modules/constructor';
export {

	abstract,
	field,
	params,
	blockProp,
	bindModTo,
	mixin,
	watch,
	mod,
	removeMod,
	elMod,
	removeElMod,
	state,
	wait

} from './modules/decorators';

const
	modsCache = {},
	initializedModsCache = {},
	classesCache = {},
	methodsCache = {};

export const
	$$ = new Store();

@component()
export default class iBlock extends BlockConstructor {
	/**
	 * Local parent component name
	 */
	with: ?string;

	/**
	 * Block unique id
	 */
	@abstract
	blockId: string;

	/**
	 * Block unique name
	 */
	blockName: ?string;

	/**
	 * Link to the current Vue component
	 */
	@abstract
	self: Vue;

	/**
	 * Link to the current component iBlock instance
	 */
	@abstract
	instance: this;

	/**
	 * Alias for $options.publicName
	 */
	@abstract
	componentName: string;

	/**
	 * Alias for $options.selfName
	 */
	@abstract
	selfComponentName: string;

	/**
	 * Alias for $options.component
	 */
	@abstract
	component: Object;

	/**
	 * Alias for $options.parentComponent
	 */
	@abstract
	parentComponent: Object;

	/**
	 * v-model component parameters
	 */
	model: ?Object;

	/**
	 * Async object
	 */
	@abstract
	async: Async;

	/**
	 * Local event object
	 */
	@abstract
	localEvent: EventEmitter2;

	/**
	 * DOM block manager
	 */
	@abstract
	block: ?Block;

	/**
	 * Block init status
	 */
	@field()
	blockStatus: string = statuses.unloaded;

	/**
	 * Some helpers
	 */
	@abstract
	h: Object;

	/**
	 * Browser constants
	 */
	@abstract
	b: Object;

	/**
	 * Block render cursor
	 */
	@field()
	i: number | string = '';

	/**
	 * Advanced block parameters
	 */
	p: Object = {};

	/**
	 * Active status
	 * (for keep alive)
	 */
	@field()
	blockActivated: boolean = true;

	/**
	 * Additional classes for block elements
	 */
	classes: Object = {};

	/**
	 * Initial block modifiers
	 */
	@blockProp('mods', 'mods')
	modsProp: Object = {};

	/**
	 * Initial block stage
	 */
	stageProp: ?string;

	/**
	 * Dispatching mode
	 */
	dispatching: boolean = false;

	/**
	 * Link to translation function
	 */
	i18n: Function = defaulti18n;

	/**
	 * If true, then the block will be reinitialized after activated
	 */
	needReInit: boolean = false;

	/**
	 * Async loading state
	 */
	@field()
	asyncLoading: boolean = false;

	/**
	 * Counter of async components
	 */
	@field()
	asyncCounter: number = 0;

	/**
	 * Queue of async components
	 */
	@abstract
	asyncQueue: Set;

	/**
	 * Cache of child async components
	 */
	@field()
	asyncComponents: Object = {};

	/**
	 * Cache of child background async components
	 */
	@field()
	asyncBackComponents: Object = {};

	/**
	 * Store of block modifiers
	 */
	@field((o) => o.link('modsProp', (val) => Object.assign(o.modsStore || {}, val)))
	modsStore: Object;

	/**
	 * Block stage
	 */
	@field((o) => o.link('stageProp'))
	stage: ?string;

	/**
	 * Cache of ifOnce
	 */
	@field()
	ifOnceStore: Object = {};

	/**
	 * Temporary cache
	 */
	@field()
	tmp: Object = {};

	/**
	 * Temporary render cache
	 */
	@field()
	renderTmp: Object = {};

	/** @private */
	@abstract
	_activeField: ?string;

	/** @private */
	@abstract
	_syncLinks: ?Object;

	/**
	 * Block modifiers
	 */
	static mods = {
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
	 * Size converter
	 */
	static sizeTo = {
		gt: {
			xxl: 'xxl',
			xl: 'xxl',
			l: 'xl',
			m: 'l',
			undefined: 'l',
			s: 'm',
			xs: 's',
			xxs: 'xs'
		},

		lt: {
			xxl: 'xl',
			xl: 'l',
			l: 'm',
			m: 's',
			undefined: 's',
			s: 'xs',
			xs: 'xxs',
			xxs: 'xxs'
		}
	};

	/**
	 * Environment value
	 */
	get currentEnv(): string {
		const {admin} = CONFIG.host;
		return admin.indexOf('staging') !== -1 || CONFIG.env === 'standalone' ? 'staging' : 'production';
	}

	/**
	 * Alias for .i18n
	 */
	get t(): Function {
		return this.i18n;
	}

	/**
	 * Link to window.l
	 */
	get l(): Function {
		return l;
	}

	/**
	 * Alias for $options.sizeTo.gt
	 */
	get gt(): Object {
		return this.$options.sizeTo.gt;
	}

	/**
	 * Alias for $options.sizeTo.lt
	 */
	get lt(): Object {
		return this.$options.sizeTo.lt;
	}

	/**
	 * Link to the global object
	 */
	get global(): Function {
		return window;
	}

	/**
	 * Link to console API
	 */
	get console(): Function {
		return console;
	}

	/**
	 * Link to window.location
	 */
	get location(): Function {
		return location;
	}

	/**
	 * Group name for the current stage
	 */
	get stageGroup(): string {
		return `stage.${this.stage}`;
	}

	/**
	 * Block modifiers
	 */
	get mods(): Object {
		const
			obj = this.modsStore,
			keys = Object.keys(obj),
			map = {};

		for (let i = 0; i < keys.length; i++) {
			const
				key = keys[i],
				el = obj[key];

			map[key] = el != null ? String(el) : el;
		}

		return map;
	}

	/**
	 * Sets an object of modifiers
	 * @param value
	 */
	set mods(value: Object) {
		this.modsStore = value;
	}

	/**
	 * Base block modifiers
	 */
	get baseMods(): Object<string> {
		return {theme: this.mods.theme, size: this.mods.size};
	}

	/**
	 * Modifiers synchronization
	 * @param value
	 */
	@wait('loading')
	@params({deep: true})
	$$modsStore(value: Object) {
		const
			keys = Object.keys(value);

		for (let i = 0; i < keys.length; i++) {
			const
				key = keys[i];

			let
				el = value[key];

			if (el === undefined) {
				this.removeMod(key, el);
				continue;
			}

			el = String(el);
			if (el !== this.block.getMod(key)) {
				this.setMod(key, el);
			}
		}
	}

	/**
	 * Async counter synchronization
	 */
	@params({immediate: true})
	$$asyncCounter(value: number) {
		this.async.setTimeout({
			label: $$.asyncLoading,
			fn: () => this.asyncLoading = false
		}, 0.2.second());

		if (value && this.$parent && 'asyncCounter' in this.$parent) {
			this.$parent.asyncCounter++;
		}
	}

	/**
	 * Stage change event
	 *
	 * @param value
	 * @param [oldValue]
	 * @emits changeStage(value: ?string, oldValue: ?string)
	 */
	$$stage(value: string, oldValue: ?string) {
		this.emit('changeStage', value, oldValue);
	}

	/**
	 * Loads block data
	 * @emits initLoad()
	 */
	@wait('loading')
	async initLoad() {
		this.block.status = this.block.statuses.ready;
		this.emit('initLoad');
	}

	/* eslint-disable no-unused-vars */

	/**
	 * Reaches the specified goal
	 * (analytics)
	 *
	 * @param goal
	 * @param params
	 */
	reachGoal(goal: string, params?: Object = {}) {}

	/* eslint-enable no-unused-vars */

	/**
	 * Returns a string id, which is connected to the block
	 * @param id - custom id
	 */
	getConnectedId(id: ?string): ?string {
		if (!id) {
			return undefined;
		}

		return `${this.blockId}-${id}`;
	}

	/**
	 * Adds a component to the render queue
	 * @param id - task id
	 */
	regAsyncComponent(id: string): string {
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
	regAsyncBackComponent(id: string): string {
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
	 * Returns an object with classes for elements of another component
	 * @param classes - additional classes ({baseElementName: newElementName})
	 */
	provideClasses(classes?: Object<string | true | Array>): Object {
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

				/* eslint-disable prefer-spread */
				map[key] = this.getFullElName.apply(this, [].concat(el));
				/* eslint-enable prefer-spread */
			}
		}

		return map;
	}

	/**
	 * Returns an object with base block modifiers
	 * @param mods - additional modifiers ({modifier: {currentValue: value}} || {modifier: value})
	 */
	provideMods(mods?: Object): Object {
		const
			key = JSON.stringify(this.baseMods) + JSON.stringify(mods),
			cache = modsCache[key];

		if (cache) {
			return cache;
		}

		const
			map = {...this.baseMods};

		if (mods) {
			const
				keys = Object.keys(mods);

			for (let i = 0; i < keys.length; i++) {
				const
					key = keys[i];

				let
					el = mods[key];

				if (!Object.isObject(el)) {
					el = {default: el};
				}

				if (key in mods === false || el[key] === undefined) {
					map[key] = el[Object.keys(el)[0]];

				} else {
					map[key] = el[key];
				}
			}
		}

		return map;
	}

	/**
	 * Sets a new Vue property
	 *
	 * @param name
	 * @param value
	 * @param [obj] - root object
	 */
	setField(name: string, value: any, obj?: Object): any {
		obj = obj || this;

		let
			ref = obj;

		const
			chunks = name.split('.');

		for (let i = 0; i < chunks.length; i++) {
			const
				prop = chunks[i];

			if (chunks.length === i + 1) {
				name = prop;
				continue;
			}

			if (!ref[prop] || typeof ref[prop] !== 'object') {
				this.$set(ref, prop, isNaN(Number(chunks[i + 1])) ? {} : []);
			}

			ref = ref[prop];
		}

		if (name in ref) {
			ref[name] = value;

		} else {
			this.$set(ref, name, value);
		}

		return value;
	}

	/**
	 * Deletes the specified Vue property
	 *
	 * @param name
	 * @param [obj] - root object
	 */
	deleteField(name: string, obj?: Object = this): boolean {
		let ref = obj;

		const
			chunks = name.split('.');

		let test = true;
		for (let i = 0; i < chunks.length; i++) {
			const
				prop = chunks[i];

			if (chunks.length === i + 1) {
				name = prop;
				continue;
			}

			if (!ref[prop] || typeof ref[prop] !== 'object') {
				test = false;
				break;
			}

			ref = ref[prop];
		}

		if (test) {
			this.$delete(ref, name);
			return true;
		}

		return false;
	}

	/**
	 * Returns the specified Vue property
	 *
	 * @param name
	 * @param [obj] - root object
	 */
	getField(name: string, obj?: Object = this): any {
		const
			chunks = name.split('.');

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
	 * Sync block links (prop to store)
	 * @param [link] - field name
	 */
	syncLinks(link?: string) {
		if (link) {
			this._syncLinks[link]();

		} else {
			$C(this._syncLinks).forEach((fn) => fn);
		}
	}

	/**
	 * Wrapper for $emit
	 *
	 * @param event
	 * @param args
	 */
	emit(event: string, ...args: any) {
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
	dispatch(event: string, ...args: any) {
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
	 * Wrapper for $on
	 *
	 * @param event
	 * @param cb
	 */
	on(event: string, cb: Function) {
		this.$on(event.dasherize(), cb);
	}

	/**
	 * Wrapper for $once
	 *
	 * @param event
	 * @param cb
	 */
	once(event: string, cb: Function) {
		this.$once(event.dasherize(), cb);
	}

	/**
	 * Wrapper for $off
	 *
	 * @param [event]
	 * @param [cb]
	 */
	off(event?: string, cb?: Function) {
		this.$off(event && event.dasherize(), cb);
	}

	/**
	 * Wrapper for $nextTick
	 *
	 * @param [join]
	 * @param [label]
	 * @param [group]
	 */
	nextTick(
		{join, label, group}?: {
			join?: boolean | 'replace',
			label?: string | Symbol,
			group?: string | Symbol
		} = {}

	): Promise {
		return this.async.promise(this.$nextTick(), {join, label, group});
	}

	/**
	 * Waits until the specified reference won't be available
	 *
	 * @param ref
	 * @param [join]
	 * @param [label]
	 * @param [group]
	 */
	waitRef(
		ref: string,
		{join, label, group}?: {
			join?: boolean | 'replace',
			label?: string | Symbol,
			group?: string | Symbol
		} = {}

	): Promise {
		return this.async.wait(() => this.$refs[ref], {join, label, group});
	}

	/**
	 * Wrapper for @wait
	 * TODO: need review
	 *
	 * @param state
	 * @param fn
	 * @param [defer] - if true, then the function will always return a promise
	 * @param [join]
	 * @param [label]
	 * @param [group]
	 */
	waitState(
		state: number | string,
		fn: Function,
		{defer, join = false, label, group}?: {
			defer?: boolean,
			join?: boolean | 'replace',
			label?: string | Symbol,
			group?: string | Symbol
		} = {}

	): Promise | any {
		return wait(state, {fn, defer, join, label, group}).call(this);
	}

	/**
	 * Wraps a handler for delegation of the specified element
	 *
	 * @param elName
	 * @param handler
	 */
	@wait('loading')
	delegateElement(elName: string, handler: Function): Promise<Function> | Function {
		return delegate(this.block.getElSelector(elName), handler);
	}

	/**
	 * Returns if the specified label:
	 *   2 -> already exists in the cache;
	 *   1 -> just written in the cache;
	 *   0 -> doesn't exist in the cache.
	 *
	 * @param label
	 * @param value - label value (will saved in the cache only if true)
	 */
	ifOnce(label: any, value: boolean): number {
		if (this.ifOnceStore[label]) {
			return 2;
		}

		if (value) {
			return this.ifOnceStore[label] = 1;
		}

		return 0;
	}

	/**
	 * Sets a block modifier
	 *
	 * @param name
	 * @param value
	 */
	@wait('loading')
	setMod(name: string, value: any): Promise<boolean> | boolean {
		return this.block.setMod(name, value);
	}

	/**
	 * Removes a block modifier
	 *
	 * @param name
	 * @param [value]
	 */
	@wait('loading')
	removeMod(name: string, value?: any): Promise<boolean> | boolean {
		return this.block.removeMod(name, value);
	}

	/**
	 * Disables the block
	 * @emits disable()
	 */
	async disable(): boolean {
		if (await this.setMod('disabled', true)) {
			this.emit('disable');
			return true;
		}

		return false;
	}

	/**
	 * Enables the block
	 * @emits enable()
	 */
	async enable(): boolean {
		if (await this.setMod('disabled', false)) {
			this.emit('enable');
			return true;
		}

		return false;
	}

	/**
	 * Sets focus to the block
	 * @emits focus()
	 */
	async focus(): boolean {
		if (await this.setMod('focused', true)) {
			this.emit('focus');
			return true;
		}

		return false;
	}

	/**
	 * Returns true if the block has all modifiers from specified
	 *
	 * @param mods - list of modifiers (['name', ['name', 'value']])
	 * @param [value] - value of modifiers
	 */
	ifEveryMods(mods: Array<Array | string>, value?: any): boolean {
		return $C(mods).every((el) => {
			if (Object.isArray(el)) {
				return this.mods[el[0]] === String(el[1]);
			}

			return this.mods[el] === String(value);
		});
	}

	/**
	 * Returns true if the block has at least one modifier from specified
	 *
	 * @param mods - list of modifiers (['name', ['name', 'value']])
	 * @param [value] - value of modifiers
	 */
	ifSomeMod(mods: Array<Array | string>, value?: any): boolean {
		return $C(mods).some((el) => {
			if (Object.isArray(el)) {
				return this.mods[el[0]] === String(el[1]);
			}

			return this.mods[el] === String(value);
		});
	}

	/**
	 * Returns a link to the closest parent component for the current
	 * @param component - component name or a link to the component constructor
	 */
	closest(component: string | Function): ?iBlock {
		const
			isStr = Object.isString(component);

		let el = this.$parent;
		while (el && (isStr ? el.componentName !== component.dasherize() : el.instance instanceof component === false)) {
			el = el.$parent;
		}

		return el;
	}

	/**
	 * Returns an instance of Vue component by the specified selector / element
	 *
	 * @param query
	 * @param [filter]
	 */
	$(query: string | Element, filter?: string = ''): ?iBlock {
		const
			$0 = Object.isString(query) ? document.query(query) : query,
			n = $0 && $0.closest(`.i-block-helper${filter}`);

		return n && n.vueComponent;
	}

	/**
	 * Binds a modifier to the specified parameter
	 *
	 * @param mod
	 * @param param
	 * @param [fn] - converter function
	 * @param [opts] - additional options
	 */
	bindModTo(mod: string, param: string, fn?: Function = Boolean, opts?: Object) {
		this.$watch(param, (val) => this.setMod(mod, fn.call(this, val, this)), {immediate: true, ...opts});
	}

	/* eslint-disable no-unused-vars */

	/**
	 * Returns the full name of the specified block
	 *
	 * @param [blockName]
	 * @param [modName]
	 * @param [modValue]
	 */
	getFullBlockName(blockName?: string = this.componentName, modName?: string, modValue?: any): string {
		return Block.prototype.getFullBlockName.call({blockName}, ...[].slice.call(arguments, 1));
	}

	/**
	 * Returns a full name of the specified element
	 *
	 * @param elName
	 * @param [modName]
	 * @param [modValue]
	 */
	getFullElName(elName: string, modName?: string, modValue?: any): string {
		return Block.prototype.getFullElName.apply({blockName: this.componentName}, arguments);
	}

	/**
	 * Sets g-hint for the specified element
	 * @param [pos] - hint position
	 */
	setHint(pos?: string = 'bottom'): Array<string> {
		return this.getBlockClasses('g-hint', {pos});
	}

	/* eslint-enable no-unused-vars */

	/**
	 * Returns an array of block classes by the specified parameters
	 *
	 * @param [blockName] - name of the source block
	 * @param mods - map of modifiers
	 */
	getBlockClasses(blockName: ?string, mods: Object): Array<string> {
		const
			key = JSON.stringify(mods) + blockName,
			cache = classesCache[key];

		if (cache) {
			return cache;
		}

		const
			classes = [this.getFullBlockName(blockName)],
			keys = Object.keys(mods);

		for (let i = 0; i < keys.length; i++) {
			const mod = keys[i];
			classes.push(this.getFullBlockName(blockName, mod, mods[mod]));
		}

		return classes;
	}

	/**
	 * Returns an array of element classes by the specified parameters
	 * @param els - map of elements with map of modifiers ({button: {focused: true}})
	 */
	getElClasses(els: Object): Array<string> {
		const
			key = JSON.stringify(els) + this.blockId,
			cache = classesCache[key];

		if (cache) {
			return cache;
		}

		const
			classes = [this.blockId],
			keys = Object.keys(els);

		for (let i = 0; i < keys.length; i++) {
			const
				el = keys[i],
				mods = els[el];

			classes.push(this.getFullElName(el));

			{
				const
					keys = Object.keys(mods);

				for (let i = 0; i < keys.length; i++) {
					const
						key = keys[i],
						val = mods[key];

					if (val !== undefined) {
						classes.push(this.getFullElName(el, key, val));
					}
				}
			}
		}

		return classes;
	}

	/**
	 * Puts the block root element to the stream
	 * @param cb
	 */
	@wait('ready')
	async putInStream(cb: (el: Element) => void): boolean {
		const
			el = this.$el;

		if (el.offsetHeight) {
			cb.call(this, el);
			return false;
		}

		const wrapper = document.createElement('div');
		Object.assign(wrapper.style, {
			'display': 'block',
			'position': 'absolute',
			'top': 0,
			'left': 0,
			'z-index': -1,
			'opacity': 0
		});

		const
			parent = el.parentNode,
			before = el.nextSibling;

		wrapper.appendChild(el);
		document.body.appendChild(wrapper);
		await cb.call(this, el);

		if (parent) {
			if (before) {
				parent.insertBefore(el, before);

			} else {
				parent.appendChild(el);
			}
		}

		wrapper.remove();
		return true;
	}

	/**
	 * Saves the specified block settings to the local storage
	 *
	 * @param settings
	 * @param [key] - block key
	 */
	async saveSettings(settings: Object, key?: string = ''): Object {
		try {
			await localforage.setItem(`${this.componentName}_${this.blockName}_${key}`, settings);
		} catch (_) {}

		return settings;
	}

	/**
	 * Loads block settings from the local storage
	 * @param [key] - block key
	 */
	async loadSettings(key?: string = ''): ?Object {
		try {
			return await localforage.getItem(`${this.componentName}_${this.blockName}_${key}`);
		} catch (_) {}
	}

	/**
	 * Block initialized
	 */
	beforeCreate() {
		this.self = this;
		this.blockId = `b-${uuid()}`;
		this.h = helpers;
		this.b = browser;
		this.async = new Async(this);
		this.asyncQueue = new Set();
		this.localEvent = new EventEmitter2({maxListeners: 100, wildcard: true});

		const addWatcher = (watcher) => {
			if (this.blockStatus) {
				watcher();

			} else {
				watchers[this.selfComponentName] = (watchers[this.selfComponentName] || []).concat(watcher);
			}
		};

		const linkCache = {};
		this._syncLinks = {};

		/**
		 * Sets a link for the specified field
		 *
		 * @param field
		 * @param [wrapper]
		 * @param [watchParams]
		 */
		this.link = function (field: string, wrapper?: Function, watchParams?: Object): any {
			const
				path = this._activeField;

			if (path in linkCache === false) {
				linkCache[path] = {};
				addWatcher(() =>
					this.$watch(field, (val) => this.setField(path, wrapper ? wrapper(val) : val), watchParams));

				const
					val = () => wrapper ? wrapper(this[field]) : this[field];

				this._syncLinks[field] = () => this.setField(path, val());
				return val();
			}
		};

		/**
		 * Creates an object with linked fields
		 *
		 * @param path - property path
		 * @param fields
		 * @param [watchParams]
		 */
		this.createWatchObject = function (path: string, fields: Array, watchParams?: Object): Object {
			if (path) {
				path = [this._activeField, path].join('.');

			} else {
				path = this._activeField;
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
						addWatcher(() =>
							this.$watch(field, (val) => this.setField(l, wrapper ? wrapper.call(this, val) : val), watchParams));

						const
							v = this.getField(field),
							val = () => wrapper ? wrapper.call(this, v) : v;

						this._syncLinks[field] = () => this.setField(l, val());
						map[el[0]] = val();
					}

				} else {
					const
						l = [path, el].join('.');

					if (!$C(linkCache).get(l)) {
						$C(linkCache).set(true, l);
						addWatcher(() => this.$watch(el, (val) => this.setField(l, val), watchParams));
						this._syncLinks[el] = () => this.setField(l, this.getField(el));
						map[el] = this.getField(el);
					}
				}
			}

			return obj;
		};
	}

	/**
	 * Block created
	 */
	created() {
		this.localEvent.emit('component.created');

		let
			methods = methodsCache[this.selfComponentName];

		if (!methods) {
			methods = methodsCache[this.selfComponentName] = {};

			const
				obj = staticComponents[this.selfComponentName].methods;

			/* eslint-disable guard-for-in */

			for (const key in obj) {
				methods[key] = obj[key];
			}

			/* eslint-enable guard-for-in */
		}

		const
			isGetter = /^(.*?)Getter$/,
			keys = Object.keys(methods);

		// Non cached getters
		for (let i = 0; i < keys.length; i++) {
			const
				key = keys[i],
				el = methods[key];

			if (isGetter.test(key) && el.cache === false) {
				Object.defineProperty(this, RegExp.$1, {
					get: this[key],
					set: this[`${RegExp.$1}Setter`]
				});
			}
		}

		const
			modsKey = JSON.stringify(this.mods) + this.$options.modsKey;

		if (!initializedModsCache[modsKey]) {
			const
				obj = this.$options.mods,
				mods = Object.assign({}, this.mods),
				keys = Object.keys(obj);

			// Applied modifiers
			for (let i = 0; i < keys.length; i++) {
				const
					mod = keys[i],
					val = obj[mod];

				if (mod in this.modsProp) {
					mods[mod] = this.modsProp[mod];
					continue;
				}

				if (val !== undefined) {
					mods[mod] = String(val);
				}
			}

			initializedModsCache[modsKey] = mods;
		}

		this.modsStore = Object.assign({}, initializedModsCache[modsKey]);
		this._localBlockProps = {};

		let
			obj = this.$options;

		while (obj) {
			const
				nm = obj.selfName,
				arr = [watchers, binds, locals];

			for (let i = 0; i < arr.length; i++) {
				const
					c = arr[i][nm];

				if (c) {
					for (let i = 0; i < c.length; i++) {
						c[i].call(this);
					}
				}
			}

			const
				c = blockProps[nm];

			if (c) {
				for (let i = 0; i < c.length; i++) {
					const el = c[i];
					this._localBlockProps[el[0]] = this[el[1]];
				}
			}

			obj = obj.parentComponent;
		}

		Object.assign(this._localBlockProps, {
			model: this,
			localEvent: this.localEvent,
			async: this.async,
			id: this.blockId
		});

		this.localEvent.on('block.mod.set.**', (e) => this.$set(this.modsStore, e.name, e.value));
		this.localEvent.on('block.mod.remove.**', (e) => this.$set(this.modsStore, e.name, undefined));
		this.localEvent.on('block.mod.*.disabled.*', (e) => {
			if (e.value === 'false' || e.type === 'remove') {
				this.async.off({group: 'blockOnDisable'});

			} else {
				this.async.on(this.$el, 'click mousedown touchstart keydown input change scroll', {
					group: 'blockOnDisable',
					fn(e) {
						e.preventDefault();
						e.stopImmediatePropagation();
					}

				}, true);
			}
		});

		this.$watch('$root.lang', () => this.$forceUpdate());
	}

	/**
	 * Block mounted
	 */
	async mounted() {
		this.localEvent.emit('component.mounted');

		if (this.block) {
			const
				{node} = this.block;

			if (node === this.$el) {
				return;
			}

			if (node.vueComponent === this) {
				delete node.vueComponent;
			}
		}

		this.setMod('mobile', Boolean(this.b.is.mobile));
		this.$el.vueComponent = this;
		this.block = new Block(Object.assign(this._localBlockProps, {node: this.$el}));
		await this.initLoad();
	}

	/**
	 * Block activated
	 * (for keep-alive)
	 */
	async activated() {
		this.localEvent.emit('component.activated');

		if (this.blockActivated) {
			return;
		}

		const {block: $b} = this;
		$b.status = $b.statuses.loading;

		if (this.needReInit) {
			await this.initLoad();

		} else {
			$b.status = $b.statuses.ready;
		}

		this.blockActivated = true;
		this.$forceUpdate();
	}

	/**
	 * Block deactivated
	 * (for keep-alive)
	 */
	deactivated() {
		this.localEvent.emit('component.deactivated');
		this.async
			.clearAllImmediates()
			.clearAllTimeouts()
			.cancelAllIdleCallbacks()
			.cancelAllAnimationFrames()
			.cancelAllRequests()
			.terminateAllWorkers()
			.cancelAllProxies();

		this.block.status = this.block.statuses.inactive;
		this.blockActivated = false;
	}

	/**
	 * Block before destroy
	 */
	beforeDestroy() {
		this.localEvent.emit('component.destroyed');
		this.block.destructor();

		$C(this.asyncQueue).forEach((el) => {
			queue.delete(el);
			backQueue.delete(el);
		});

		this.block.status = this.block.statuses.inactive;
	}
}

function defaulti18n(): string {
	/* eslint-disable prefer-spread */
	return this.$root.i18n.apply(this.$root, arguments);
	/* eslint-enable prefer-spread */
}
