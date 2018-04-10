/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// tslint:disable:max-file-line-count
import $C = require('collection.js');
import { EventEmitter2 as EventEmitter } from 'eventemitter2';
import { WatchOptions, RenderContext, VNode } from 'vue';

import 'super/i-block/modules/vue.directives';
import Async, { AsyncOpts } from 'core/async';
import Block, { statuses } from 'super/i-block/modules/block';
import symbolGenerator from 'core/symbol';

import iPage from 'super/i-page/i-page';
import { asyncLocal, AsyncNamespace } from 'core/kv-storage';
import {

	component,
	hook,
	execRenderObject,
	patchVNode,
	ModVal,
	ModsDecl,
	VueInterface,
	VueElement,
	PARENT

} from 'core/component';

import { prop, field, system, watch, wait } from 'super/i-block/modules/decorators';
import { queue, backQueue } from 'core/render';
import { delegate } from 'core/dom';

import * as helpers from 'core/helpers';
import * as browser from 'core/const/browser';

export * from 'core/component';
export { statuses } from 'super/i-block/modules/block';
export {

	prop,
	field,
	system,
	watch,
	wait,
	bindModTo,
	mod,
	removeMod,
	elMod,
	removeElMod,
	state

} from 'super/i-block/modules/decorators';

export type Classes = Dictionary<string | Array<string | true> | true>;
export type WatchObjectField =
	string |
	[string] |
	[string, string] |
	[string, LinkWrapper] |
	[string, string, LinkWrapper];

export type WatchObjectFields = Array<WatchObjectField>;
export interface LinkWrapper {
	(this: this, value: any, oldValue: any): any;
}

export interface SizeTo {
	gt: Dictionary<string>;
	lt: Dictionary<string>;
}

export type ModsTable = Dictionary<ModVal>;
export type ModsNTable = Dictionary<string | undefined>;

/**
 * Cache helper
 */
export class Cache<T extends string = string> {
	/**
	 * Cache dictionary
	 */
	dict: Dictionary = Object.createDict();

	/**
	 * @param [namespaces] - predefined namespaces
	 */
	constructor(namespaces?: string[]) {
		$C(namespaces).forEach((el) => {
			this.dict[el] = Object.createDict();
		});
	}

	/**
	 * Creates a cache object by the specified parameters and returns it
	 */
	create(nms: T, cacheKey?: string): Dictionary {
		const
			cache = this.dict[nms] = this.dict[nms] || Object.createDict();

		if (cacheKey) {
			cache[cacheKey] = cache[cacheKey] || Object.createDict();
			return cache[cacheKey];
		}

		return cache;
	}
}

export const
	$$ = symbolGenerator(),
	modsCache = Object.createDict(),
	literalCache = Object.createDict(),
	classesCache = new Cache<'base' | 'blocks' | 'els'>(['base', 'blocks', 'els']);

@component()
export default class iBlock extends VueInterface<iBlock, iPage> {
	/**
	 * Block unique id
	 */
	@system(() => `uid-${Math.random().toString().slice(2)}`)
	readonly blockId!: string;

	/**
	 * Link to i18n function
	 */
	@prop(Function)
	readonly i18n: typeof i18n = defaultI18n;

	/**
	 * Block unique name
	 */
	@prop({type: String, required: false})
	readonly blockName?: string;

	/**
	 * Initial block modifiers
	 */
	@prop(Object)
	readonly modsProp: ModsTable = {};

	/**
	 * Initial block stage
	 */
	@prop({type: String, required: false})
	readonly stageProp?: string;

	/**
	 * Block stage
	 */
	@field((o) => o.link('stageProp'))
	stage?: string;

	/**
	 * Group name for the current stage
	 */
	get stageGroup(): string {
		return `stage.${this.stage}`;
	}

	/**
	 * Dispatching mode
	 */
	@prop(Boolean)
	readonly dispatching: boolean = false;

	/**
	 * If true, then the block will be reinitialized after activated
	 */
	@prop(Boolean)
	readonly needReInit: boolean = false;

	/**
	 * Additional classes for block elements
	 */
	@prop(Object)
	readonly classes: Classes = {};

	/**
	 * Advanced block parameters
	 */
	@prop(Object)
	readonly p: Dictionary = {};

	/**
	 * Base block modifiers
	 */
	get baseMods(): Readonly<ModsNTable> {
		const
			m = this.mods;

		return Object.freeze({
			theme: m.theme,
			size: m.size
		});
	}

	/**
	 * Block modifiers
	 */
	@system((o) => {
		const
			declMods = o.meta.component.mods,
			attrMods = <string[][]>[],
			modVal = (val) => val != null ? String(val) : val;

		for (let attrs = o.$attrs, keys = Object.keys(attrs), i = 0; i < keys.length; i++) {
			const
				key = keys[i];

			if (key in declMods) {
				attrMods.push([key, attrs[key]]);
				o.$watch(`$attrs.${key}`, (val) => o.setMod(key, modVal(val)));
			}
		}

		return o.link('modsProp', (val) => {
			const
				declMods = o.meta.component.mods,
				// tslint:disable-next-line:prefer-object-spread
				mods = Object.assign(o.mods || {...declMods}, val);

			for (let i = 0; i < attrMods.length; i++) {
				const [key, val] = attrMods[i];
				mods[key] = val;
			}

			for (let keys = Object.keys(mods), i = 0; i < keys.length; i++) {
				const
					key = keys[i],
					val = modVal(mods[key]);

				mods[key] = val;
				o.hook !== 'beforeDataCreate' && o.setMod(key, val);
			}

			return mods;
		});
	})

	readonly mods!: ModsNTable;

	/**
	 * Parent link
	 */
	static readonly PARENT: object = PARENT;

	/**
	 * Block modifiers
	 */
	static readonly mods: ModsDecl = {
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
	static sizeTo: SizeTo = {
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
	 * Alias for iBlock.sizeTo.gt
	 */
	protected get gt(): Dictionary<string> {
		return (<any>this.instance.constructor).sizeTo.gt;
	}

	/**
	 * Alias for iBlock.sizeTo.lt
	 */
	protected get lt(): Dictionary<string> {
		return (<any>this.instance.constructor).sizeTo.lt;
	}

	/**
	 * Block initialize status
	 */
	@system()
	protected blockStatus: string = statuses[statuses.unloaded];

	/**
	 * Active status
	 * (for keep alive)
	 */
	@system()
	protected blockActivated: boolean = true;

	/**
	 * Watched store of block modifiers
	 */
	@field()
	protected watchModsStore: ModsNTable = {};

	/**
	 * Watched block modifiers
	 */
	protected get m(): Readonly<ModsNTable> {
		const
			o = {},
			w = this.watchModsStore,
			m = this.mods;

		for (let keys = Object.keys(m), i = 0; i < keys.length; i++) {
			const
				key = keys[i],
				val = m[key];

			if (key in w) {
				o[key] = val;

			} else {
				Object.defineProperty(o, key, {
					get: () => {
						if (!(key in w)) {
							w[key] = val;
						}

						return val;
					}
				});
			}
		}

		return Object.freeze(o);
	}

	/**
	 * Cache of ifOnce
	 */
	@field()
	protected readonly ifOnceStore: Dictionary = {};

	/**
	 * Temporary cache
	 */
	@system()
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
	protected readonly self!: iBlock;

	/**
	 * API for async operations
	 */
	@system((ctx) => new Async(ctx))
	protected async!: Async<this>;

	/**
	 * API for BEM like develop
	 */
	@system()
	protected block!: Block<this>;

	/**
	 * Local event emitter
	 */
	@system(() => new EventEmitter({maxListeners: 100, wildcard: true}))
	protected readonly localEvent!: EventEmitter;

	/**
	 * Storage object
	 */
	@system((o) => asyncLocal.namespace(o.componentName))
	protected readonly storage!: AsyncNamespace;

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
	protected readonly asyncQueue!: Set<Function>;

	/**
	 * Cache of child async components
	 */
	@field()
	protected readonly asyncComponents: Dictionary<string> = {};

	/**
	 * Cache of child background async components
	 */
	@field()
	protected readonly asyncBackComponents: Dictionary<string> = {};

	/**
	 * Some helpers
	 */
	@system(() => helpers)
	protected readonly h!: typeof helpers;

	/**
	 * Browser constants
	 */
	@system(() => browser)
	protected readonly b!: typeof browser;

	/**
	 * Alias for .i18n
	 */
	protected get t(): typeof i18n {
		return this.i18n;
	}

	/**
	 * Link to window.l
	 */
	@system(() => l)
	protected readonly l!: typeof l;

	/**
	 * Link to console API
	 */
	@system(() => console)
	protected readonly console!: Console;

	/**
	 * Link to window.location
	 */
	@system(() => location)
	protected readonly location!: Location;

	/**
	 * Cache for prop/field links
	 */
	@system()
	private linkCache!: Dictionary<Dictionary>;

	/**
	 * Cache for prop/field links
	 */
	@system()
	private syncLinkCache!: Dictionary<Function>;

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
	 * Wrapper for $emit
	 *
	 * @param event
	 * @param args
	 */
	emit(event: string, ...args: any[]): void {
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
	dispatch(event: string, ...args: any[]): void {
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
	 * Wrapper for @wait
	 *
	 * @see Async.promise
	 * @param state
	 * @param fn
	 * @param [params] - additional parameters:
	 *   *) [params.defer] - if true, then the function will always return a promise
	 */
	waitState<T>(state: number | string, fn: () => T, params?: AsyncOpts & {defer?: boolean}): CanPromise<T> {
		params = params || {};
		params.join = false;
		return wait(state, {fn, ...params}).call(this);
	}

	/**
	 * Wrapper for $forceUpdate
	 */
	@wait('loading', {defer: true, label: $$.forceUpdate})
	async forceUpdate(): Promise<void> {
		this.$forceUpdate();
	}

	/**
	 * Loads block data
	 * @emits initLoad()
	 */
	@wait('loading')
	@hook({mounted: 'initBlockInstance'})
	initLoad(): CanPromise<void> {
		this.block.status = this.block.statuses.ready;
		this.emit('initLoad');
	}

	/**
	 * Returns an array of block classes by the specified parameters
	 *
	 * @param [blockName] - name of the source block
	 * @param mods - map of modifiers
	 */
	getBlockClasses(blockName: string | undefined, mods: ModsTable): ReadonlyArray<string>;

	/**
	 * @param mods - map of modifiers
	 */
	getBlockClasses(mods: ModsTable): ReadonlyArray<string>;
	getBlockClasses(blockName: string | undefined | ModsTable, mods?: ModsTable): ReadonlyArray<string> {
		if (arguments.length === 1) {
			mods = <ModsTable>blockName;
			blockName = undefined;

		} else {
			mods = <ModsTable>mods;
			blockName = <string | undefined>blockName;
		}

		const
			key = JSON.stringify(mods) + blockName,
			cache = classesCache.create('blocks', this.componentName);

		if (cache[key]) {
			return cache[key];
		}

		const
			classes = cache[key] = [this.getFullBlockName(blockName)];

		for (let keys = Object.keys(mods), i = 0; i < keys.length; i++) {
			const
				key = keys[i],
				val = mods[key];

			if (val !== undefined) {
				classes.push(this.getFullBlockName(blockName, key, val));
			}
		}

		return classes;
	}

	/**
	 * Sets a block modifier
	 *
	 * @param name
	 * @param value
	 */
	@wait('loading')
	setMod(name: string, value: any): CanPromise<boolean> {
		return this.block.setMod(name, value);
	}

	/**
	 * Removes a block modifier
	 *
	 * @param name
	 * @param [value]
	 */
	@wait('loading')
	removeMod(name: string, value?: any): CanPromise<boolean> {
		return this.block.removeMod(name, value);
	}

	/**
	 * Disables the block
	 * @emits disable()
	 */
	async disable(): Promise<boolean> {
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
	async enable(): Promise<boolean> {
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
	async focus(): Promise<boolean> {
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
	ifEveryMods(mods: Array<string | string[]>, value?: ModVal): boolean {
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
	ifSomeMod(mods: Array<string | string[]>, value?: ModVal): boolean {
		return $C(mods).some((el) => {
			if (Object.isArray(el)) {
				return this.mods[el[0]] === String(el[1]);
			}

			return this.mods[el] === String(value);
		});
	}

	/**
	 * Executes the specified render object
	 *
	 * @param renderObj
	 * @param [ctx] - render context
	 */
	protected execRenderObject(renderObj: Dictionary, ctx?: RenderContext): VNode {
		const
			vnode = execRenderObject(renderObj, this);

		if (ctx) {
			return patchVNode(vnode, <any>this, ctx);
		}

		return vnode;
	}

	/**
	 * Returns the full name of the specified block
	 *
	 * @param [blockName]
	 * @param [modName]
	 * @param [modValue]
	 */
	protected getFullBlockName(blockName: string = this.componentName, modName?: string, modValue?: any): string {
		return Block.prototype.getFullBlockName.call({blockName}, ...[].slice.call(arguments, 1));
	}

	/**
	 * Returns a full name of the specified element
	 *
	 * @param elName
	 * @param [modName]
	 * @param [modValue]
	 */
	protected getFullElName(elName: string, modName?: string, modValue?: any): string {
		return Block.prototype.getFullElName.apply({blockName: this.componentName}, arguments);
	}

	/**
	 * Sets g-hint for the specified element
	 * @param [pos] - hint position
	 */
	protected setHint(pos: string = 'bottom'): ReadonlyArray<string> {
		return this.getBlockClasses('g-hint', {pos});
	}

	/**
	 * Returns an array of element classes by the specified parameters
	 * @param els - map of elements with map of modifiers ({button: {focused: true}})
	 */
	protected getElClasses(els: Dictionary<ModsTable>): ReadonlyArray<string> {
		const
			key = JSON.stringify(els),
			cache = classesCache.create('els', this.blockId);

		if (cache[key]) {
			return cache[key];
		}

		const
			classes = cache[key] = [this.blockId];

		for (let keys = Object.keys(els), i = 0; i < keys.length; i++) {
			const
				el = keys[i],
				mods = els[el];

			classes.push(
				this.getFullElName(el)
			);

			for (let keys = Object.keys(mods), i = 0; i < keys.length; i++) {
				const
					key = keys[i],
					val = mods[key];

				if (val !== undefined) {
					classes.push(this.getFullElName(el, key, val));
				}
			}
		}

		return Object.freeze(classes);
	}

	/**
	 * Puts the block root element to the stream
	 * @param cb
	 */
	@wait('ready')
	protected async putInStream(cb: (el: Element) => void): Promise<boolean> {
		const
			el = this.$el;

		if (el.clientHeight) {
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
	protected async saveSettings<T extends Object = Dictionary>(settings: T, key: string = ''): Promise<T> {
		try {
			await this.storage.set(`${this.blockName}_${key}`, JSON.stringify(settings));
		} catch (_) {}

		return settings;
	}

	/**
	 * Loads block settings from the local storage
	 * @param [key] - block key
	 */
	protected async loadSettings<T extends Object = Dictionary>(key: string = ''): Promise<T | undefined> {
		try {
			const str = await this.storage.get(`${this.blockName}_${key}`);
			return str && JSON.parse(str);
		} catch (_) {}
	}

	/**
	 * Wraps a handler for delegation of the specified element
	 *
	 * @param elName
	 * @param handler
	 */
	@wait('loading')
	protected delegateElement(elName: string, handler: Function): CanPromise<Function> {
		return delegate(this.block.getElSelector(elName), handler);
	}

	/**
	 * Returns a link to the closest parent component for the current
	 * @param component - component name or a link to the component constructor
	 */
	protected closest<T extends iBlock = iBlock>(component: string | {new: T}): T | undefined {
		const
			isStr = Object.isString(component);

		let el = this.$parent;
		while (el && (
			isStr ?
				el.componentName !== (<string>component).dasherize() :
				!(el.instance instanceof <any>component)
		)) {
			el = el.$parent;
		}

		return <any>el;
	}

	/**
	 * Returns an instance of Vue component by the specified element
	 *
	 * @param el
	 * @param [filter]
	 */
	protected $<T extends iBlock = iBlock>(el: VueElement<T>, filter?: string): T;

	/**
	 * Returns an instance of Vue component by the specified query
	 *
	 * @param query
	 * @param [filter]
	 */
	protected $<T extends iBlock = iBlock>(query: string, filter?: string): T | undefined;
	protected $<T extends iBlock = iBlock>(query: string | VueElement<T>, filter: string = ''): T | undefined {
		const
			$0 = Object.isString(query) ? document.query(query) : query,
			n = $0 && $0.closest(`.i-block-helper${filter}`) as any;

		return n && n.vueComponent;
	}

	/**
	 * Binds a modifier to the specified field
	 *
	 * @param mod
	 * @param field
	 * @param [converter] - converter function
	 * @param [opts] - watch options
	 */
	protected bindModTo<T = this>(
		mod: string,
		field: string,
		converter: ((value: any, ctx: T) => any) | WatchOptions = Boolean,
		opts?: WatchOptions
	): void {
		if (!Object.isFunction(converter)) {
			opts = converter;
			converter = Boolean;
		}

		const
			fn = <Function>converter;

		const setWatcher = () => {
			this.$watch(field, (val) => {
				this.setMod(mod, fn(val, this));

			}, {
				immediate: true,
				...opts
			});
		};

		if (this.blockStatus === statuses[statuses.unloaded]) {
			const
				{hooks} = this.meta;

			hooks.beforeDataCreate.push({
				fn: (data) => {
					this.mods[mod] = String(fn(data[field], this));
				}
			});

			hooks.created.push({
				fn: setWatcher
			});

		} else if (statuses[this.blockStatus] >= 1) {
			setWatcher();
		}
	}

	/**
	 * Returns if the specified label:
	 *   2 -> already exists in the cache;
	 *   1 -> just written in the cache;
	 *   0 -> doesn't exist in the cache.
	 *
	 * @param label
	 * @param [value] - label value (will saved in the cache only if true)
	 */
	protected ifOnce(label: any, value: boolean = false): 0 | 1 | 2 | 3 {
		if (this.meta.params.functional === true) {
			return 3;
		}

		if (this.ifOnceStore[label]) {
			return 2;
		}

		if (value) {
			return this.ifOnceStore[label] = 1;
		}

		return 0;
	}

	/**
	 * Wrapper for $nextTick
	 *
	 * @see Async.promise
	 * @param [params]
	 */
	protected nextTick(params?: AsyncOpts): Promise<void> {
		return this.async.promise(this.$nextTick(), params);
	}

	/**
	 * Waits until the specified reference won't be available
	 * and returns it
	 *
	 * @see Async.wait
	 * @param ref
	 * @param [params]
	 */
	protected async waitRef<T = iBlock | Element | iBlock[] | Element[]>(ref: string, params?: AsyncOpts): Promise<T> {
		await this.async.wait(() => this.$refs[ref], params);
		return <any>this.$refs[ref];
	}

	/**
	 * Initializes core block API
	 */
	@hook('beforeRuntime')
	protected initBaseAPI(): void {
		this.linkCache = {};
		this.syncLinkCache = {};

		const
			i = this.instance;

		this.link = i.link.bind(this);
		this.createWatchObject = i.createWatchObject.bind(this);
		this.bindModTo = i.bindModTo.bind(this);
		this.execCbAfterCreated = i.execCbAfterCreated.bind(this);
		this.execCbBeforeDataCreated = i.execCbBeforeDataCreated.bind(this);
		this.getField = i.getField.bind(this);

		const
			{$watch} = this;

		if ($watch) {
			// @ts-ignore
			this.$watch = (...args) => this.execCbBeforeDataCreated(() => $watch.apply(this, args));
		}
	}

	/**
	 * Sets a new watch property to the specified object
	 *
	 * @param path - path to the property (bla.baz.foo)
	 * @param value
	 * @param [obj]
	 */
	protected setField(path: string, value: any, obj: object = this): any {
		let
			ref = obj;

		const
			chunks = path.split('.'),
			isSystem = this.meta.systemFields[chunks[0]];

		for (let i = 0; i < chunks.length; i++) {
			const
				prop = chunks[i];

			if (chunks.length === i + 1) {
				path = prop;
				continue;
			}

			if (!ref[prop] || typeof ref[prop] !== 'object') {
				const
					val = isNaN(Number(chunks[i + 1])) ? {} : [];

				if (isSystem) {
					ref[prop] = val;

				} else {
					this.$set(ref, prop, val);
				}
			}

			ref = ref[prop];
		}

		if (path in ref) {
			ref[path] = value;

		} else {
			if (isSystem) {
				ref[path] = value;

			} else {
				this.$set(ref, path, value);
			}
		}

		return value;
	}

	/**
	 * Deletes a watch property from the specified object
	 *
	 * @param path - path to the property (bla.baz.foo)
	 * @param [obj]
	 */
	protected deleteField(path: string, obj: object = this): boolean {
		let ref = obj;

		const
			chunks = path.split('.'),
			isSystem = this.meta.systemFields[chunks[0]];

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
			if (isSystem) {
				delete ref[path];

			} else {
				this.$delete(ref, path);
			}

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
	protected getField(path: string, obj: object = this): any {
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
	 * @param [watchParams]
	 */
	protected link(field: string, watchParams?: WatchOptions): any;

	/**
	 * @param field
	 * @param [wrapper]
	 */
	// tslint:disable-next-line:unified-signatures
	protected link(field: string, wrapper?: LinkWrapper): any;

	/**
	 * @param field
	 * @param watchParams
	 * @param wrapper
	 */
	// tslint:disable-next-line:unified-signatures
	protected link(field: string, watchParams: WatchOptions, wrapper: LinkWrapper): any;
	protected link(field: string, watchParams?: WatchOptions | LinkWrapper, wrapper?: LinkWrapper): any {
		if (watchParams && Object.isFunction(watchParams)) {
			wrapper = watchParams;
			watchParams = undefined;
		}

		const
			path = this.$activeField,
			isSystem = this.meta.systemFields[path.split('.')[0]];

		if (!(path in this.linkCache)) {
			this.linkCache[path] = {};
			this.execCbAfterCreated(() => {
				this.$watch(field, (val, oldVal) => {
					if (!Object.fastCompare(val, oldVal)) {
						this.setField(path, wrapper ? wrapper.call(this, val, oldVal) : val);
					}
				}, <WatchOptions>watchParams);
			});

			const val = () => {
				const
					res = wrapper ? wrapper.call(this, this[field]) : this[field];

				if (isSystem || this.hook !== 'beforeCreate') {
					this.setField(path, res);
				}

				return res;
			};

			this.syncLinkCache[field] = () => this.setField(path, val());
			return this.execCbBeforeDataCreated(val);
		}
	}

	/**
	 * Creates an object with linked fields
	 *
	 * @param path - property path
	 * @param fields
	 */
	protected createWatchObject(
		path: string,
		fields: WatchObjectFields
	): Dictionary;

	/**
	 * @param path - property path
	 * @param watchParams
	 * @param fields
	 */
	protected createWatchObject(
		path: string,
		watchParams: WatchOptions,
		fields: WatchObjectFields
	): Dictionary;

	protected createWatchObject(
		path: string,
		watchParams: WatchOptions | WatchObjectFields,
		fields?: WatchObjectFields
	): Dictionary {
		if (Object.isArray(watchParams)) {
			fields = watchParams;
			watchParams = {};
		}

		const
			{linkCache, syncLinkCache} = this;

		// tslint:disable-next-line
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

		for (let i = 0; i < (<WatchObjectFields>fields).length; i++) {
			const
				el = (<WatchObjectFields>fields)[i];

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
						this.$watch(field, (val, oldVal) => {
							if (!Object.fastCompare(val, oldVal)) {
								this.setField(l, wrapper ? wrapper.call(this, val, oldVal) : val);
							}
						}, <WatchOptions>watchParams);
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
						this.$watch(el, (val, oldVal) => {
							if (!Object.fastCompare(val, oldVal)) {
								this.setField(l, val);
							}
						}, <WatchOptions>watchParams);
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
	 * Synchronization for the asyncCounter field
	 * @param value
	 */
	@watch({field: 'asyncCounter', immediate: true})
	protected syncAsyncCounterWatcher(value: number): void {
		const disableAsync = () => {
			this.asyncLoading = false;
		};

		this.async.setTimeout(disableAsync, 0.2.second(), {
			label: $$.asyncLoading
		});

		if (value && this.$parent && 'asyncCounter' in this.$parent) {
			this.$parent.asyncCounter++;
		}
	}

	/**
	 * Synchronization for the stage field
	 *
	 * @param value
	 * @param oldValue
	 */
	@watch({field: 'stage', immediate: true})
	protected syncStageWatcher(value: string, oldValue: string | undefined): void {
		this.emit('changeStage', value, oldValue);
	}

	/**
	 * Returns an object with classes for elements of an another component
	 * @param classes - additional classes ({baseElementName: newElementName})
	 */
	protected provideClasses(classes?: Classes): Readonly<Dictionary<string>> {
		const
			key = JSON.stringify(classes),
			cache = classesCache.create('base');

		if (cache[key]) {
			return cache[key];
		}

		const
			map = cache[key] = {};

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

				map[key] = this.getFullElName.apply(this, (<any[]>[]).concat(el));
			}
		}

		return Object.freeze(map);
	}

	/**
	 * Returns an object with base block modifiers
	 * @param mods - additional modifiers ({modifier: {currentValue: value}} || {modifier: value})
	 */
	protected provideMods(mods?: Dictionary<ModVal | Dictionary<ModVal>>): Readonly<ModsNTable> {
		const
			key = JSON.stringify(this.baseMods) + JSON.stringify(mods);

		if (modsCache[key]) {
			return modsCache[key];
		}

		const
			map = modsCache[key] = {...this.baseMods};

		if (mods) {
			const
				keys = Object.keys(mods);

			for (let i = 0; i < keys.length; i++) {
				const
					key = keys[i];

				let
					el = <any>mods[key];

				if (!Object.isObject(el)) {
					el = {default: el};
				}

				// tslint:disable-next-line
				if (!(key in mods) || el[key] === undefined) {
					map[key] = el[Object.keys(el)[0]];

				} else {
					map[key] = el[key];
				}
			}
		}

		return Object.freeze(map);
	}

	/**
	 * Saves to cache the specified literal and returns returns it
	 * @param literal
	 */
	protected memoizeLiteral<T extends Dictionary | any[]>(literal: T): T extends any[] ? ReadonlyArray<T> : Readonly<T> {
		const key = JSON.stringify(literal);
		return modsCache[key] = modsCache[key] || Object.freeze(literal);
	}

	/**
	 * Initializes block instance
	 */
	@hook('mounted')
	protected initBlockInstance(): void {
		if (this.block) {
			const
				{node} = this.block;

			if (node === this.$el) {
				return;
			}

			if (node && node.vueComponent === this) {
				delete node.vueComponent;
			}
		}

		this.block = new Block({
			id: this.blockId,
			node: this.$el,
			async: this.async,
			localEvent: this.localEvent,
			mods: this.mods,
			model: this
		});
	}

	/**
	 * Initializes modifiers event listeners
	 */
	@hook('beforeCreate')
	protected initModEvents(): void {
		const
			{async: $a, localEvent: $e} = this;

		$e.on('block.mod.set.**', (e) => {
			const
				k = e.name,
				v = e.value,
				w = this.watchModsStore;

			this
				.mods[k] = v;

			if (k in w && w[k] !== v) {
				delete w[k];
				this.$set(w, k, v);
			}
		});

		$e.on('block.mod.remove.**', (e) => {
			if (e.reason === 'removeMod') {
				const
					k = e.name,
					w = this.watchModsStore;

				this
					.mods[k] = undefined;

				if (k in w && w[k]) {
					delete w[k];
					this.$set(w, k, undefined);
				}
			}
		});

		$e.on('block.mod.*.disabled.*', (e) => {
			if (e.value === 'false' || e.type === 'remove') {
				$a.off({group: 'blockOnDisable'});

			} else {
				const handler = (e) => {
					e.preventDefault();
					e.stopImmediatePropagation();
				};

				$a.on(this.$el, 'click mousedown touchstart keydown input change scroll', handler, {
					group: 'blockOnDisable',
					options: {
						capture: true
					}
				});
			}
		});
	}

	/**
	 * Block created
	 */
	protected created(): void {
		this.localEvent.emit('component.created');
	}

	/**
	 * Block mounted to DOM
	 */
	protected async mounted(): Promise<void> {
		this.localEvent.emit('component.mounted');
	}

	/**
	 * Block activated
	 * (for keep-alive)
	 */
	protected async activated(): Promise<void> {
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
		await this.forceUpdate();
	}

	/**
	 * Block deactivated
	 * (for keep-alive)
	 */
	protected deactivated(): void {
		this.localEvent.emit('component.deactivated');

		this.async
			.clearImmediate()
			.clearTimeout()
			.cancelIdleCallback();

		this.async
			.cancelAnimationFrame()
			.cancelRequest()
			.terminateWorker()
			.cancelProxy();

		this.block.status = this.block.statuses.inactive;
		this.blockActivated = false;
	}

	/**
	 * Block before destroy
	 */
	protected beforeDestroy(): void {
		this.localEvent.emit('component.destroyed');

		if (this.block) {
			this.block.destructor();

		} else {
			this.blockStatus = statuses[statuses.destroyed];
			this.async.clearAll();
			this.localEvent.removeAllListeners();
		}

		$C(this.asyncQueue).forEach((el) => {
			queue.delete(el);
			backQueue.delete(el);
		});

		delete classesCache.dict.els[this.blockId];
	}

	/**
	 * Executes the specified callback after beforeDataCreate hook and returns the result
	 * @param cb
	 */
	private execCbBeforeDataCreated<T>(cb: Function): T | undefined {
		if (this.hook === 'beforeRuntime') {
			this.meta.hooks.beforeDataCreate.push({fn: cb});
			return;
		}

		return cb.call(this);
	}

	/**
	 * Executes the specified callback after created hook and returns the result
	 * @param cb
	 */
	private execCbAfterCreated<T>(cb: Function): T | undefined {
		if (statuses[this.blockStatus]) {
			return cb.call(this);
		}

		this.meta.hooks.created.push({fn: cb});
	}
}

/**
 * Hack for i-block decorators
 */
export abstract class iBlockDecorator extends iBlock {
	public readonly h!: typeof helpers;
	public readonly b!: typeof browser;
	public readonly t!: typeof i18n;

	public async!: Async<this>;
	public readonly block!: Block<this>;
	public readonly localEvent!: EventEmitter;

	// tslint:disable-next-line:unified-signatures
	public abstract link(field: string, watchParams?: WatchOptions): any;
	// tslint:disable-next-line:unified-signatures
	public abstract link(field: string, wrapper?: LinkWrapper): any;
	// tslint:disable-next-line:unified-signatures
	public abstract link(field: string, watchParams?: WatchOptions, wrapper?: LinkWrapper): any;

	public abstract createWatchObject(
		path: string,
		fields: WatchObjectFields
	): Dictionary;

	public abstract createWatchObject(
		path: string,
		watchParams: WatchOptions,
		fields: WatchObjectFields
	): Dictionary;

	public abstract bindModTo<T = this>(
		mod: string,
		field: string,
		converter: ((value: any, ctx: T) => any) | WatchOptions,
		opts?: WatchOptions
	): void;
}

function defaultI18n(): string {
	return this.$root.i18n.apply(this.$root, arguments);
}
