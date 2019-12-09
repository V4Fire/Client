/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import iBlock from 'super/i-block/i-block';

import { ObserveOptions, Observer, Observers, ChangedNodes } from 'traits/i-observe-dom/interface';

export * from 'traits/i-observe-dom/interface';

export const
	$$ = symbolGenerator();

export default abstract class iObserveDom {
	/**
	 * Starts to observe DOM changes for the specified element
	 *
	 * @param component
	 * @param options
	 */
	static observe<T extends iBlock>(component: T & iObserveDom, options: ObserveOptions): void {
		const
			{node} = options,
			observers = iObserveDom.getObserversMap(component);

		if (observers.has(node)) {
			iObserveDom.unobserve(component, node);
		}

		observers.set(node, iObserveDom.createObserver(component, options));
	}

	/**
	 * Stops to observe the specified element
	 *
	 * @param component
	 * @param node
	 */
	static unobserve<T extends iBlock>(component: T & iObserveDom, node: Element): void {
		const
			// @ts-ignore (access)
			{async: $a} = component,
			observers = iObserveDom.getObserversMap(component);

		const
			observer = observers.get(node);

		if (!observer) {
			return;
		}

		observers.delete(node);
		$a.clearAll({label: observer.key});
	}

	/**
	 * Filters added and removed nodes
	 *
	 * @param records
	 * @param filter
	 */
	static filterNodes(records: MutationRecord[], filter: (node: Node) => boolean): MutationRecord[] {
		return records.map((r) => ({
			...r,
			addedNodes: [].filter.call(r.addedNodes, filter),
			removedNodes: [].filter.call(r.removedNodes, filter)
		}));
	}

	/**
	 * Returns changed nodes
	 * @param records
	 */
	static getChangedNodes(records: MutationRecord[]): ChangedNodes {
		const res = {
			addedNodes: <ChangedNodes['addedNodes']>[],
			removedNodes: <ChangedNodes['removedNodes']>[]
		};

		for (let i = 0; i < records.length; i++) {
			res.addedNodes = res.addedNodes.concat([].slice.call(records[i].addedNodes));
			res.removedNodes = res.removedNodes.concat([].slice.call(records[i].removedNodes));
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
	 * @param [options]
	 *
	 * @emits DOMChange(records?: MutationRecord[], options?: ObserverOptions)
	 */
	static onDOMChange<T extends iBlock>(
		component: T & iObserveDom,
		records?: MutationRecord[],
		options?: ObserveOptions
	): void {
		component.emit('DOMChange', records, options);
	}

	/**
	 * Returns component observers map
	 * @param component
	 */
	protected static getObserversMap<T extends iBlock>(component: T & iObserveDom): Observers {
		return component[$$.DOMObservers] || (component[$$.DOMObservers] = new Map());
	}

	/**
	 * Creates an observer
	 *
	 * @param component
	 * @param options
	 */
	protected static createObserver<T extends iBlock>(component: T & iObserveDom, options: ObserveOptions): Observer {
		const
			// @ts-ignore (access)
			{async: $a} = component,
			{node} = options,
			label = iObserveDom.getObserverKey();

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
	 * Returns uniq key for observer
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
