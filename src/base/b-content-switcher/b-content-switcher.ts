/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import { observeMap } from 'core/component/helpers/observable';

import iObserveDom from 'traits/i-observe-dom/i-observe-dom';

import iBlock, {

	component,
	prop,
	system,

	hook,
	watch,
	wait,
	p,

	ModsDecl,
	ComponentElement

} from 'super/i-block/i-block';

export * from 'super/i-block/i-block';

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

export const
	$$ = symbolGenerator();

export const resolveMethods = Object.createDict({
	semaphore: true,
	mutation: true,
	components: true
});

export const resolveStrategy = Object.createDict({
	every: true,
	some: true
});

export type ResolveMethod = keyof typeof resolveMethods;
export type ResolveStrategy = keyof typeof resolveStrategy;

/**
 * Validates a "resolve" prop
 * @param value
 */
export function validateResolve(value: ResolveMethod[]): boolean {
	return value.every((v) => resolveMethods[v]);
}

@component()
export default class bContentSwitcher extends iBlock implements iObserveDom {
	/**
	 * Resolve methods
	 */
	@prop({
		type: Array,
		required: false,
		validator: validateResolve
	})

	readonly resolve?: ResolveMethod[];

	/**
	 * Resolve strategy
	 *   *) if "every", then a content will be shown when all of the resolve methods returns true
	 *   *) if "some", then a content will be shown when at least one of the resolve methods returns true
	 */
	@prop({
		type: String,
		required: false,
		validator: (v: string) => resolveStrategy[v]
	})

	readonly resolveStrategy: ResolveStrategy = 'every';

	/**
	 * If true, then a content won't be hidden after the state change
	 */
	@prop(Boolean)
	readonly resolveOnce: boolean = false;

	/**
	 * If true, then a placeholder will be hidden at start
	 */
	@prop(Boolean)
	readonly placeholderHidden: boolean = false;

	/**
	 * Keys for a semaphore strategy
	 */
	@prop({type: Object, required: false})
	readonly semaphoreKeysProp?: Dictionary;

	/** @see semaphoreKeys */
	@system((o) => o.sync.link('semaphoreKeysProp', (v: Dictionary) => ({...v})))
	semaphoreKeys?: Dictionary;

	/**
	 * Link to a content node
	 */
	@p({cache: false})
	get content(): CanPromise<HTMLElement> {
		return this.waitStatus('loading', () => {
			const {$refs: {content}, contentNodeStore} = this;
			return contentNodeStore || content.querySelector<HTMLElement>(this.contentNodeMarker) || content;
		});
	}

	/**
	 * Number of DOM nodes within a content block
	 */
	@p({cache: false})
	get contentLength(): number {
		return this.contentLengthStore;
	}

	/** @inheritDoc */
	static readonly mods: ModsDecl = {
		animation: [
			['none'],
			'fade'
		]
	};

	/**
	 * Map for ready components
	 */
	@system((o: bContentSwitcher) => observeMap(new Map(), () => o.setSwitchReadiness()))
	protected semaphoreReadyMap!: Map<iBlock, boolean>;

	/**
	 * Mutation observer instance
	 */
	@system()
	protected mutationObserver: CanUndef<MutationObserver>;

	/**
	 * Number of DOM nodes within a content block
	 */
	@system()
	protected contentLengthStore: number = 0;

	/**
	 * Selector of a content node
	 */
	@system()
	protected contentNodeMarker: string = '[data-switcher-content]';

	/**
	 * Store of a content node
	 */
	@system()
	protected contentNodeStore: Nullable<HTMLElement> = null;

	/**
	 * Strategies readiness map
	 */
	@system((o: bContentSwitcher): IsStrategyReadyMap => ({
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
	@system((o: bContentSwitcher): IsTable => ({
		readyToSwitchStore: false,
		placeholderHidden: false,
		mutationReady: false,
		manual: () =>  !o.resolve || !o.resolve.length
	}))

	protected is!: IsTable;

	/**
	 * True if possible to display a content block
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

	/** @see iObserveDom.initDOMObservers */
	@wait('loading')
	initDOMObservers(): CanPromise<void> {
		const
			content = <HTMLElement>this.content;

		iObserveDom.observe(this, {
			node: content,
			childList: true,
			characterData: true
		});
	}

	/** @see iObserveDom.onDOMChange */
	onDOMChange(records: MutationRecord[]): void {
		records = iObserveDom.filterNodes(records, (node) => node instanceof HTMLElement);

		const
			{addedNodes, removedNodes} = iObserveDom.getChangedNodes(records);

		this.contentLengthStore += addedNodes.length - removedNodes.length;
		iObserveDom.onDOMChange(this, records);
	}

	/**
	 * Sets readiness for switching
	 */
	@hook('mounted')
	protected setSwitchReadiness(): void {
		const
			{is, resolve, resolveOnce, resolveStrategy} = this;

		if (resolveOnce && this.isReadyToSwitch) {
			return;
		}

		this.isReadyToSwitch = is.manual() || (<ResolveMethod[]>resolve)[resolveStrategy]((r) => this.isStrategyReady[r]());
	}

	/**
	 * Initializes base placeholder state
	 */
	@hook('created')
	protected initPlaceholderState(): void {
		const {is, placeholderHidden} = this;
		is.placeholderHidden = placeholderHidden;

		if (placeholderHidden) {
			this.setMod('hidden', true);
		}
	}

	/**
	 * Initializes resolve strategies
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
	@wait('loading')
	protected initMutationStrategy(): CanPromise<void> {
		const
			content = <HTMLElement>this.content;

		const defferCheck = this.lazy.createLazyFn(() => {
			this.is.mutationReady = this.contentLengthStore > 0;
			this.setSwitchReadiness();
		}, {label: $$.defferCheck, join: true});

		this.contentLengthStore =
			content.children.length;

		defferCheck();
		this.on('DOMChange', defferCheck, {label: $$.initMutation});
		this.initDOMObservers();
	}

	/**
	 * Initializes a component readiness wait strategy
	 */
	@wait('loading')
	protected initComponentsStrategy(): CanPromise<void> {
		const
			{semaphoreReadyMap, async: $a} = this;

		const subscribe = (c: iBlock) => {
			if (semaphoreReadyMap.has(c)) {
				return;
			}

			semaphoreReadyMap.set(c, c.isReady);
			$a.on(c, 'statusReady', () => semaphoreReadyMap.set(c, true), {label: `ready-${c.componentId}`});
			$a.on(c, 'statusLoading statusUnloaded', () => semaphoreReadyMap.set(c, false), {label: `loading-${c.componentId}`});
			$a.on(c, 'statusDestroyed', () => semaphoreReadyMap.delete(c), {label: `destroy-${c.componentId}`});
		};

		const register = () => {
			const
				content = <HTMLElement>this.content,
				nodes = content.querySelectorAll(':scope > .i-block-helper');

			for (let i = 0; i < nodes.length; i++) {
				const
					el = nodes[i],
					component = (<ComponentElement>el).component as CanUndef<iBlock>;

				if (component) {
					subscribe(component);
				}
			}
		};

		const defferRegister = this.lazy.createLazyFn(register, {label: $$.register});
		defferRegister();

		this.initDOMObservers();
		this.on('DOMChange', defferRegister, {label: $$.initReady});
	}
}
