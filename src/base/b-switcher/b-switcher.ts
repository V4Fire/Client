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

export type ResolveMethod = keyof typeof resolveMethods;

/**
 * Validates a "resolve" prop
 * @param v
 */
export function validateResolve(v: CanArray<ResolveMethod>): boolean {
	return (<ResolveMethod[]>[]).concat(v).every((a) => Boolean(resolveMethods[a]));
}

@component()
export default class bSwitcher extends iBlock {
	/**
	 * Resolve strategy
	 */
	@prop({
		type: [String, Array],
		required: false,
		validator: validateResolve
	})

	readonly resolve?: CanArray<ResolveMethod>;

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
	@system((o: bSwitcher) => o.sync.link('semaphoreKeysProp'))
	protected semaphoreKeys?: Dictionary;

	/**
	 * Map for ready components
	 */
	@system((o: bSwitcher) => createCallbackMap(o.updateReadiness))
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
	 * Store for isReadyToSwitch
	 */
	@system()
	protected isReadyToSwitchStore: boolean = false;

	/**
	 * True if placeholder is hidden
	 */
	@system()
	protected isPlaceholderHidden: boolean = false;

	/**
	 * True if the mutation strategy is resolved
	 */
	@system()
	protected isMutationReady: boolean = false;

	/**
	 * True if possible to display content
	 */
	@p({cache: false})
	protected get isReadyToSwitch(): boolean {
		return this.isReadyToSwitchStore;
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
		this.isReadyToSwitchStore = value;

		if (!this.isManual) {
			this[value ? 'hide' : 'show']();
		}
	}

	/**
	 * True if all semaphore keys are resolved
	 */
	@p({cache: false})
	protected get isSemaphoreReady(): boolean {
		const
			{semaphoreKeys} = this;

		if (!semaphoreKeys) {
			return true;
		}

		return Object.keys(semaphoreKeys).every((k) => Boolean(semaphoreKeys[k]));
	}

	/**
	 * True if all child components in content block is ready
	 */
	@p({cache: false})
	protected get isComponentsReady(): boolean {
		if (!this.semaphoreReadyMap.size) {
			return false;
		}

		let
			isSomeoneNotReady = false;

		this.semaphoreReadyMap.forEach((v) => {
			if (!v) {
				isSomeoneNotReady = true;
			}
		});

		return !isSomeoneNotReady;
	}

	/**
	 * True if the component does not have a resolver
	 */
	protected get isManual(): boolean {
		return !this.resolve || !this.resolve.length;
	}

	/** @override */
	protected $refs!: {
		content: HTMLElement;
	};

	/**
	 * Hides a placeholder, displays a content
	 */
	hide(): boolean {
		if (this.isPlaceholderHidden) {
			return false;
		}

		this.isPlaceholderHidden = true;
		this.setMod('hidden', true);
		return true;
	}

	/**
	 * Hides a content, displays a placeholder
	 */
	show(): boolean {
		if (!this.isPlaceholderHidden) {
			return false;
		}

		this.isPlaceholderHidden = false;
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

		if (!semaphoreKeys || !semaphoreKeys || !(prop in semaphoreKeys)) {
			return false;
		}

		// @ts-ignore (symbol)
		semaphoreKeys[prop] = value;
		this.updateReadiness();
		return true;
	}

	/**
	 * Initializes a resolve strategy
	 */
	@hook('mounted')
	@watch('resolve')
	protected initResolveStrategy(): void {
		const
			{resolve} = this;

		if (!resolve) {
			return;
		}

		(<ResolveMethod[]>[]).concat(resolve).forEach((r) => {
			const
				initializer = this[`init${r.capitalize()}`];

			if (Object.isFunction(initializer)) {
				initializer();
			}
		});

	}

	/**
	 * Initializes a mutation observer strategy
	 */
	protected initMutation(): void {
		const
			{$refs: {content}} = this;

		const check = () => {
			const
				{nodesLength} = this;

			this.isMutationReady = nodesLength > 0;
			this.updateReadiness();
		};

		this.nodesLength = content.children.length;

		check();
		this.on('contentMutation', () => check, {label: $$.initMutation});
		this.createMutationObserver();
	}

	/**
	 * Initializes a component readiness wait strategy
	 */
	@hook('mounted')
	protected initReady(): void {
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
				{$refs: {content}} = this,
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

		const defferRegister = () => {
			this.async.setTimeout(() => {
				register();
			}, 50, {label: $$.register, join: true});
		};

		defferRegister();
		this.createMutationObserver();

		this.on('contentMutation', () => {
			defferRegister();
		}, {label: $$.initReady});
	}

	/**
	 * Creates a mutation observer
	 * @emits contentMutation()
	 */
	protected createMutationObserver(): void {
		const
			{$refs: {content}} = this;

		this.mutationObserver = new MutationObserver((rec) => {
			for (let i = 0; i < rec.length; i++) {
				this.nodesLength += rec[i].addedNodes.length - rec[i].removedNodes.length;
			}

			this.emit('contentMutation');
		});

		this.mutationObserver.observe(content, {
			childList: true
		});

		this.async.worker(this.mutationObserver, {
			label: $$.mutationObserver
		});
	}

	/**
	 * Returns true if all strategies are resolved
	 */
	@hook('mounted')
	protected updateReadiness(): boolean {
		const
			{isManual, resolve, resolveOnce} = this;

		if (resolveOnce && this.isReadyToSwitch) {
			return true;
		}

		// tslint:disable-next-line: prefer-conditional-expression
		if (isManual) {
			this.isReadyToSwitch = true;

		} else {
			this.isReadyToSwitch = (<ResolveMethod[]>[]).concat(resolve || []).every((r) => this[`is${r.capitalize()}Ready`]);
		}

		return this.isReadyToSwitch;
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
