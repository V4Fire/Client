/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import { ComponentElement } from 'core/component/interface';
import iBlock, { component, prop, hook, watch, system, p, ModsDecl } from 'super/i-block/i-block';
export * from 'super/i-block/i-block';

export const
	$$ = symbolGenerator();

export const resolveMethods = {
	semaphore: true,
	mutation: true,
	components: true
};

export interface IsTable {
	readyToSwitchStore: boolean;
	placeholderHidden: boolean;
	mutationReady: boolean;
	manual(): boolean;
}

export interface FilteredMutations {
	added: HTMLElement[];
	removed: HTMLElement[];
}

export type IsStrategyReadyMap = Record<ResolveMethod, () => boolean>;
export type ResolveMethod = keyof typeof resolveMethods;

/**
 * Validates a "resolve" prop
 * @param value
 */
export function validateResolve(value: ResolveMethod[]): boolean {
	return value.every((a) => Boolean(resolveMethods[a]));
}

@component()
export default class bSwitcher extends iBlock {
	/**
	 * Resolve strategy
	 */
	@prop({
		type: Array,
		required: false,
		validator: validateResolve
	})

	readonly resolve?: ResolveMethod[];

	/**
	 * If true, then the content won't be hidden after the state change
	 */
	@prop(Boolean)
	readonly resolveOnce: Boolean = false;

	/**
	 * Keys for semaphore strategy
	 */
	@prop({type: Object, required: false})
	readonly semaphoreKeysProp?: Dictionary;

	/** @inheritDoc */
	static readonly mods: ModsDecl = {
		animation: [
			['none'],
			'fade'
		]
	};

	/**
	 * @see semaphoreKeys
	 */
	@system((o: bSwitcher) => o.sync.link('semaphoreKeysProp', (v) => ({...v})))
	protected semaphoreKeys?: Dictionary;

	/**
	 * Map for ready components
	 */
	@system((o: bSwitcher) => createCallbackMap(() => o.setSwitchReadiness()))
	protected semaphoreReadyMap!: Map<iBlock, boolean>;

	/**
	 * Mutation observer instance
	 */
	@system()
	protected mutationObserver: CanUndef<MutationObserver>;

	/**
	 * Number of DOM nodes within the content block
	 */
	@system()
	protected nodesLength: number = 0;

	/**
	 * Selector of content node
	 */
	@system()
	protected contentNodeMarker: string = '[data-switcher-content]';

	/**
	 * Store of content node
	 */
	@system()
	protected contentNodeStore: Nullable<HTMLElement> = null;

	/**
	 * Strategies readiness map
	 */
	@system((o: bSwitcher): IsStrategyReadyMap => ({
		mutation: () => o.is.mutationReady,

		semaphore: () => {
			const keys = o.semaphoreKeys;
			return keys ? Object.keys(keys).every((k) => Boolean(keys[k])) : true;
		},

		components: () => {
			const map = o.semaphoreReadyMap;
			return map.size ? [...map].every((c) => c[1]) : false;
		}
	}))

	protected isStrategyReady!: IsStrategyReadyMap;

	/**
	 * Is table
	 */
	@system((o: bSwitcher): IsTable => ({
		readyToSwitchStore: false,
		placeholderHidden: false,
		mutationReady: false,
		manual: () =>  !o.resolve || !o.resolve.length
	}))

	protected is!: IsTable;

	/**
	 * True if possible to display content
	 */
	@p({cache: false})
	protected get isReadyToSwitch(): boolean {
		return this.is.readyToSwitchStore;
	}

	/**
	 * @param value
	 * @emits change(isHidden: boolean)
	 */
	protected set isReadyToSwitch(value: boolean) {
		if (this.isReadyToSwitch === value) {
			return;
		}

		this.emit('change', value);
		this.is.readyToSwitchStore = value;

		if (!this.is.manual()) {
			this[value ? 'hidePlaceholder' : 'showPlaceholder']();
		}
	}

	/**
	 * Link to content node
	 */
	@p({cache: false})
	protected get contentNode(): HTMLElement {
		const
			{$refs: {content}, contentNodeStore} = this;

		return contentNodeStore || content.querySelector(this.contentNodeMarker) || content;
	}

	/** @override */
	protected $refs!: {
		content: HTMLElement;
	};

	/**
	 * Hides a placeholder, displays a content
	 */
	hidePlaceholder(): boolean {
		if (this.is.placeholderHidden) {
			return false;
		}

		this.is.placeholderHidden = true;
		this.setMod('hidden', true);
		return true;
	}

	/**
	 * Hides a content, displays a placeholder
	 */
	showPlaceholder(): boolean {
		if (!this.is.placeholderHidden) {
			return false;
		}

		this.is.placeholderHidden = false;
		this.removeMod('hidden', true);
		return true;
	}

	/**
	 * Sets a readiness of the specified semaphore key
	 *
	 * @param prop
	 * @param value
	 */
	setSemaphoreKeyState(prop: string | number | symbol, value: boolean): boolean {
		const
			{semaphoreKeys} = this;

		if (!semaphoreKeys || !(prop in semaphoreKeys)) {
			return false;
		}

		// @ts-ignore (symbol)
		semaphoreKeys[prop] = value;
		this.setSwitchReadiness();
		return true;
	}

	/**
	 * Sets readiness for switching
	 */
	@hook('mounted')
	protected setSwitchReadiness(): void {
		const
			{is, resolve, resolveOnce} = this;

		if (resolveOnce && this.isReadyToSwitch) {
			return;
		}

		this.isReadyToSwitch = is.manual() || (<ResolveMethod[]>resolve).every((r) => this.isStrategyReady[r]());
	}

	/**
	 * Initializes a resolve strategies
	 */
	@hook('mounted')
	@watch('resolve')
	protected initResolvers(): void {
		const
			{resolve} = this;

		if (!resolve) {
			return;
		}

		resolve.forEach((r) => {
			const
				initializer = this[`init${r.capitalize()}Strategy`];

			if (Object.isFunction(initializer)) {
				initializer();
			}
		});

	}

	/**
	 * Initializes a mutation observer strategy
	 */
	protected initMutationStrategy(): void {
		const
			{contentNode} = this;

		const defferCheck = this.lazy.createLazyFn(() => {
			const
				{nodesLength} = this;

			this.is.mutationReady = nodesLength > 0;
			this.setSwitchReadiness();
		}, {label: $$.defferCheck, join: true});

		this.nodesLength = contentNode.children.length;

		defferCheck();
		this.on('contentMutation', defferCheck, {label: $$.initMutation});
		this.createMutationObserver();
	}

	/**
	 * Initializes a component readiness wait strategy
	 */
	protected initComponentsStrategy(): void {
		const
			{semaphoreReadyMap, async: $a} = this;

		const subscribe = (c: iBlock) => {
			if (semaphoreReadyMap.has(c)) {
				return;
			}

			semaphoreReadyMap.set(c, c.isReady);
			$a.on(c, 'statusReady', () => semaphoreReadyMap.set(c, true), {label: $$.ready});
			$a.on(c, 'statusLoading statusUnloaded', () => semaphoreReadyMap.set(c, false), {label: $$.loading});
			$a.on(c, 'statusDestroyed', () => semaphoreReadyMap.delete(c), {label: $$.destroy});
		};

		const register = () => {
			const
				{contentNode} = this,
				nodes = contentNode.querySelectorAll(':scope > .i-block-helper');

			for (let i = 0; i < nodes.length; i++) {
				const
					el = nodes[i],
					component = (<ComponentElement>el).component as CanUndef<iBlock>;

				if (component) {
					subscribe(component);
				}
			}
		};

		const
			defferRegister = this.lazy.createLazyFn(register, {label: $$.register});

		defferRegister();
		this.createMutationObserver();
		this.on('contentMutation', defferRegister, {label: $$.initReady});
	}

	/**
	 * Creates a mutation observer
	 * @emits contentMutation()
	 */
	protected createMutationObserver(): void {
		const
			{contentNode} = this;

		const nodesFilter = (rec: MutationRecord[]): FilteredMutations => {
			let
				added = [],
				removed = [];

			for (let i = 0; i < rec.length; i++) {
				const r = rec[i];
				added = added.concat([].slice.call(r.addedNodes));
				removed = removed.concat([].slice.call(r.removedNodes));
			}

			const filter = (n) => n instanceof HTMLElement;

			return {
				added: added.filter(filter),
				removed: removed.filter(filter)
			};
		};

		this.mutationObserver = new MutationObserver((rec) => {
			const v = nodesFilter(rec);
			this.nodesLength += v.added.length - v.removed.length;
			this.emit('contentMutation');
		});

		this.mutationObserver.observe(contentNode, {
			childList: true,
			characterData: false
		});

		this.async.worker(this.mutationObserver, {
			label: $$.mutationObserver
		});
	}
}

/**
 * Creates a map which will trigger specified callback on every method call
 * @param cb
 */
function createCallbackMap<K, V>(cb: Function): Map<K, V> {
	const
		map = new Map<K, V>(),
		mapSet = map.set,
		mapDelete = map.delete,
		mapClear = map.clear;

	map.set = function (k: K, v: V): Map<K, V> {
		const
			r = mapSet.call(this, k, v),
			args = [k, v, 'set'];

		cb(...args);
		return r;
	};

	map.delete = function (k: K): boolean {
		const
			r = mapDelete.call(this, k),
			args = [k, 'delete'];

		cb(...args);
		return r;
	};

	map.clear = function (): void {
		mapClear.call(this);
		cb('clear');
	};

	return map;
}
