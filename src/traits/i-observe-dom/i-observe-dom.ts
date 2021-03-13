/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:traits/i-observe-dom/README.md]]
 * @packageDocumentation
 */

import symbolGenerator from 'core/symbol';
import type iBlock from 'super/i-block/i-block';

import type {

	ObserveOptions,
	Observer,
	Observers,
	ObserverMutationRecord,
	ChangedNodes

} from 'traits/i-observe-dom/interface';

export * from 'traits/i-observe-dom/interface';

export const
	$$ = symbolGenerator();

export default abstract class iObserveDOM {
	/**
	 * Starts to observe DOM changes of the specified node
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
	 * Stops to observe DOM changes of the specified node
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
	static filterNodes(records: MutationRecord[], filter: (node: Node) => boolean): ObserverMutationRecord[] {
		return records.map((r) => ({
			...r,
			addedNodes: Array.from(r.addedNodes).filter(filter),
			removedNodes: Array.from(r.removedNodes).filter(filter)
		}));
	}

	/**
	 * Returns changed nodes
	 * @param records
	 */
	static getChangedNodes(records: MutationRecord[] | ObserverMutationRecord[]): ChangedNodes {
		const res = {
			addedNodes: <ChangedNodes['addedNodes']>[],
			removedNodes: <ChangedNodes['removedNodes']>[]
		};

		for (let i = 0; i < records.length; i++) {
			res.addedNodes = res.addedNodes.concat(Array.from(records[i].addedNodes));
			res.removedNodes = res.removedNodes.concat(Array.from(records[i].removedNodes));
		}

		res.addedNodes = [].union(res.addedNodes);
		res.removedNodes = [].union(res.removedNodes);

		return res;
	}

	/**
	 * @deprecated
	 * @see [[iObserveDOM.emitDOMChange]]
	 */
	static onDOMChange<T extends iBlock>(
		component: T & iObserveDOM,
		records?: MutationRecord[],
		opts?: ObserveOptions
	): void {
		this.emitDOMChange(component, records, opts);
	}

	/**
	 * Fires an event that DOM tree was changed
	 *
	 * @param component
	 * @param [records]
	 * @param [opts]
	 *
	 * @emits `localEmitter:DOMChange(records?: MutationRecord[], options?: ObserverOptions)`
	 * @emits `DOMChange(records?: MutationRecord[], options?: ObserverOptions)`
	 */
	static emitDOMChange<T extends iBlock>(
		component: T & iObserveDOM,
		records?: MutationRecord[],
		opts?: ObserveOptions
	): void {
		component.unsafe.localEmitter.emit('DOMChange', records, opts);
		component.emit('DOMChange', records, opts);
	}

	/**
	 * Returns true if `MutationObserver` is already observing the specified node
	 *
	 * @param component
	 * @param node
	 */
	static isNodeBeingObserved<T extends iBlock & iObserveDOM>(component: T, node: Element): boolean {
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
	 * Creates an observer
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
	 * Generates the unique key and returns it
	 */
	protected static getObserverKey(): string {
		return String(Math.random());
	}

	/**
	 * Initializes observers
	 */
	abstract initDOMObservers(): void;

	/**
	 * Handler: DOM tree was changed
	 *
	 * @param records
	 * @param options
	 */
	abstract onDOMChange(records: MutationRecord[], options: ObserveOptions): void;
}
