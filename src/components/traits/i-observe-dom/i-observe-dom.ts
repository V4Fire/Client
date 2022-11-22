/* eslint-disable @typescript-eslint/no-unused-vars-experimental */

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/traits/i-observe-dom/README.md]]
 * @packageDocumentation
 */

import symbolGenerator from 'core/symbol';
import type iBlock from 'components/super/i-block/i-block';

import type {

	Observer,
	Observers,
	ObserveOptions,

	ObserverMutationRecord,
	ChangedNodes

} from 'components/traits/i-observe-dom/interface';

export * from 'components/traits/i-observe-dom/interface';

const
	$$ = symbolGenerator();

export default abstract class iObserveDOM {
	/**
	 * Starts watching for changes to the DOM of the specified node
	 *
	 * @param component
	 * @param opts
	 */
	static observe<T extends iBlock>(component: T & iObserveDOM, opts: ObserveOptions): void {
		const
			{node} = opts;

		const
			observers = this.getObserversMap(component);

		if (!opts.reInit && this.isNodeBeingObserved(component, opts.node)) {
			return;
		}

		if (observers.has(node)) {
			this.unobserve(component, node);
		}

		observers.set(node, iObserveDOM.createObserver(component, opts));
	}

	/**
	 * Stops watching for changes to the DOM of the specified node
	 *
	 * @param component
	 * @param node
	 */
	static unobserve<T extends iBlock>(component: T & iObserveDOM, node: Element): void {
		const
			observers = this.getObserversMap(component),
			observer = observers.get(node);

		if (!observer) {
			return;
		}

		observers.delete(node);
		component.unsafe.async.clearAll({label: observer.key});
	}

	/**
	 * Filters added and removed nodes
	 *
	 * @param records
	 * @param filter
	 */
	static filterMutations(records: MutationRecord[], filter: (node: Node) => AnyToBoolean): ObserverMutationRecord[] {
		return records.map((r) => ({
			...r,
			addedNodes: Array.from(r.addedNodes).filter(filter),
			removedNodes: Array.from(r.removedNodes).filter(filter)
		}));
	}

	/**
	 * Removes duplicates from `addedNodes` and `removedNodes` lists and returns the changed nodes
	 * @param records
	 */
	static getChangedNodes(records: MutationRecord[] | ObserverMutationRecord[]): ChangedNodes {
		const res: ChangedNodes = {
			addedNodes: [],
			removedNodes: []
		};

		records.forEach((mut) => {
			res.addedNodes = res.addedNodes.concat(Array.from(mut.addedNodes));
			res.removedNodes = res.removedNodes.concat(Array.from(mut.removedNodes));
		});

		res.addedNodes = [].union(res.addedNodes);
		res.removedNodes = [].union(res.removedNodes);

		return res;
	}

	/** @see [[iObserveDOM.onDOMChange]] */
	static onDOMChange: AddSelf<iObserveDOM['onDOMChange'], iBlock & iObserveDOM> = (
		component,
		records,
		opts
	) => {
		this.emitDOMChange(component, records, opts);
	};

	/**
	 * Fires an event that the DOM tree has changed
	 *
	 * @param component
	 * @param [records]
	 * @param [opts]
	 *
	 * @emits `localEmitter:DOMChange(records?: MutationRecord[], options?: ObserverOptions)`
	 */
	static emitDOMChange<T extends iBlock>(
		component: T & iObserveDOM,
		records?: MutationRecord[],
		opts?: ObserveOptions
	): void {
		component.unsafe.localEmitter.emit('DOMChange', records, opts);
	}

	/**
	 * Returns `true` if the specified node is being observed via `iObserveDOM`
	 *
	 * @param component
	 * @param node
	 */
	static isNodeBeingObserved<T extends iBlock>(component: T & iObserveDOM, node: Element): boolean {
		return this.getObserversMap(component).has(node);
	}

	/**
	 * Returns a map of component observers
	 * @param component
	 */
	protected static getObserversMap<T extends iBlock>(component: T & iObserveDOM): Observers {
		return component[$$.DOMObservers] ?? (component[$$.DOMObservers] = new Map());
	}

	/**
	 * Creates an observer with the passed options
	 *
	 * @param component
	 * @param opts
	 */
	protected static createObserver<T extends iBlock>(component: T & iObserveDOM, opts: ObserveOptions): Observer {
		const
			{async: $a} = component.unsafe,
			{node} = opts;

		const
			label = this.getObserverKey();

		const observer = new MutationObserver((records) => {
			component.onDOMChange(records, opts);
		});

		observer.observe(node, opts);
		$a.worker(observer, {label});

		return {
			key: label,
			observer
		};
	}

	/**
	 * Generates a unique key and returns it
	 */
	protected static getObserverKey(): string {
		return String(Math.random());
	}

	/**
	 * Initializes observers
	 */
	abstract initDOMObservers(): void;

	/**
	 * Handler: the DOM tree has been changed
	 *
	 * @param records
	 * @param opts
	 */
	onDOMChange(records: MutationRecord[], opts: ObserveOptions): void {
		return Object.throw();
	}
}
