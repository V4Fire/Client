/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import iBlock from 'super/i-block/i-block';

import {

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
	 * Starts to observe DOM changes by the specified options
	 *
	 * @param component
	 * @param opts
	 */
	static observe<T extends iBlock>(component: T & iObserveDOM, opts: ObserveOptions): void {
		const
			{node} = opts;

		const
			observers = this.getObserversMap(component);

		if (observers.has(node)) {
			this.unobserve(component, node);
		}

		observers.set(node, iObserveDOM.createObserver(component, opts));
	}

	/**
	 * Stops to observe DOM changes for the specified node
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

		// @ts-ignore (access)
		component.async.clearAll({label: observer.key});
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
	 * Handler: DOM tree was changed
	 *
	 * @param component
	 * @param [records]
	 * @param [opts]
	 *
	 * @emits DOMChange(records?: MutationRecord[], options?: ObserverOptions)
	 */
	static onDOMChange<T extends iBlock>(
		component: T & iObserveDOM,
		records?: MutationRecord[],
		opts?: ObserveOptions
	): void {
		component.emit('DOMChange', records, opts);
	}

	/**
	 * Returns a component observers map
	 * @param component
	 */
	protected static getObserversMap<T extends iBlock>(component: T & iObserveDOM): Observers {
		return component[$$.DOMObservers] || (component[$$.DOMObservers] = new Map());
	}

	/**
	 * Creates an observer
	 *
	 * @param component
	 * @param options
	 */
	protected static createObserver<T extends iBlock>(component: T & iObserveDOM, options: ObserveOptions): Observer {
		const
			// @ts-ignore (access)
			{async: $a} = component,
			{node} = options,
			label = this.getObserverKey();

		const observer = new MutationObserver((records) => {
			component.onDOMChange(records, options);
		});

		observer.observe(node, options);
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
	 * Handler: DOM tree was changed
	 *
	 * @param records
	 * @param options
	 */
	abstract onDOMChange(records: MutationRecord[], options: ObserveOptions): void;
}
