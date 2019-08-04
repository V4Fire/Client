/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';

import iBlock, { component, prop, hook, system, p, ModsDecl } from 'super/i-block/i-block';

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
 * Validates a resolve prop
 * @param v
 */
export function validateResolve(v: ResolveMethod | ResolveMethod[]): boolean {
	return (<ResolveMethod[]>[]).concat(v).every((a) => Boolean(resolveMethods[a]));
}

@component({functional: true})
export default class bSwitcher extends iBlock {
	/**
	 * Resolve strategy of skeleton
	 */
	@prop({
		required: false,
		type: [String, Array],
		validator: validateResolve
	})

	readonly resolve?: ResolveMethod | ResolveMethod[];

	/**
	 * If true then after resolve state change will not be switched
	 */
	@prop(Boolean)
	readonly resolveOnce: Boolean = false;

	/**
	 * Keys for semaphore strategy
	 */
	@prop({
		required: false,
		type: Object
	})

	readonly semaphoreKeys?: Dictionary;

	/** @inheritDoc */
	static readonly mods: ModsDecl = {
		animation: [
			['none'],
			'fade'
		]
	};

	/**
	 * Mutable duplicate of semaphoreStore
	 */
	@system()
	protected semaphoreStore?: Dictionary;

	/**
	 * Map of component readiness
	 */
	@system({
		init: (v: bSwitcher) => createCallbackMap(v.updateReadiness)
	})

	protected semaphoreReadyMap!: Map<iBlock, boolean>;

	/**
	 * Mutation observer
	 */
	@system()
	protected mutationObserver: CanUndef<MutationObserver>;

	/**
	 * Number of DOM Nodes in content slot
	 */
	@system()
	protected nodesLength: number = 0;

	/**
	 * Store for isReadyToSwitch
	 */
	@system()
	protected isReadyToSwitchStore: boolean = false;

	/**
	 * True if switcher able to show content
	 */
	@p({cache: false})
	protected get isReadyToSwitch(): boolean {
		return this.isReadyToSwitchStore;
	}

	/**
	 * Sets isReadyToSwitch state
	 *
	 * @param v
	 * @emits change(isHidden: boolean)
	 */
	protected set isReadyToSwitch(v: boolean) {
		if (this.isReadyToSwitch === v) {
			return;
		}

		this.emit('change', v);
		this.isReadyToSwitchStore = v;

		if (!this.isManual) {
			this[v ? 'hide' : 'show']();
		}
	}

	/**
	 * True if placeholder is hidden
	 */
	@system()
	protected isHidden: boolean = false;

	/**
	 * True is mutation awaiter is resolved
	 */
	@system()
	protected isMutationReady: boolean = false;

	/**
	 * True if all semaphore keys are resolved
	 */
	protected get isSemaphoreReady(): boolean {
		const
			{semaphoreStore} = this;

		if (!semaphoreStore) {
			return true;
		}

		return Object.keys(semaphoreStore).every((k) => Boolean(semaphoreStore[k]));
	}

	/**
	 * True if all child components in content slot are ready
	 */
	protected get isComponentsReady(): boolean {
		if (!this.semaphoreReadyMap.size) {
			return false;
		}

		let isSomeoneNotReady = false;

		this.semaphoreReadyMap.forEach((v) => {
			if (!v) {
				isSomeoneNotReady = true;
			}
		});

		return !isSomeoneNotReady;
	}

	/**
	 * True if there is no resolver
	 */
	protected get isManual(): boolean {
		return !this.resolve || !this.resolve.length;
	}

	/** @override */
	protected $refs!: {
		content: HTMLElement;
	};

	/**
	 * Hides a placeholder, shows a content
	 */
	hide(): boolean {
		if (this.isHidden) {
			return false;
		}

		this.isHidden = true;
		this.setMod('hidden', true);
		return true;
	}

	/**
	 * Hides a content, shows a placeholder
	 */
	show(): boolean {
		if (!this.isHidden) {
			return false;
		}

		this.isHidden = false;
		this.removeMod('hidden', true);
		return true;
	}

	/**
	 * Sets a readiness of prop
	 *
	 * @param isReady
	 * @param prop
	 */
	semaphore(prop: string | number | symbol, v: boolean): boolean {
		const
			{semaphoreKeys, semaphoreStore} = this;

		if (!semaphoreKeys || !semaphoreStore || !(prop in semaphoreKeys)) {
			return false;
		}

		// @ts-ignore (symbol)
		semaphoreStore[prop] = v;
		this.updateReadiness();
		return true;
	}

	/**
	 * Initializes specified resolve strategy
	 */
	@hook('mounted')
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

		this.on('contentMutation', () => {
			check();

		}, {label: $$.initMutation});

		this.nodesLength = content.children.length;

		check();
		this.createMutationObserver();
	}

	/**
	 * Initializes a ready watching strategy
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
					component = (<any>el).component as CanUndef<iBlock>;

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
	 * Initializes a semaphore strategy
	 */
	protected initSemaphore(): void {
		this.semaphoreStore = {...this.semaphoreKeys};
	}

	/**
	 * Creates a mutation observer
	 * @emits contentMutation()
	 */
	protected createMutationObserver(): void {
		if (this.mutationObserver) {
			this.mutationObserver.disconnect();
			this.async.clearWorker({label: $$.mutationObserver});
		}

		const
			{$refs: {content}} = this;

		this.mutationObserver = new MutationObserver((rec) => {
			for (let i = 0; i < rec.length; i++) {
				const
					r = rec[i];

				this.nodesLength += r.addedNodes.length - r.removedNodes.length;
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
	 * Returns true if all awaiters are resolved
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
 * Creates a map which will trigger specified callback on every action
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
