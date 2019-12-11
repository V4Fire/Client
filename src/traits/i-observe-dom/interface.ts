/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export interface ObserveOptions extends MutationObserverInit {
	node: Element;
	label?: string | symbol | number;
}

export interface Observer {
	key: string;
	observer: MutationObserver;
}

export interface ChangedNodes {
	addedNodes: Node[];
	removedNodes: Node[];
}

export interface ObserverMutationRecord extends Omit<MutationRecord, keyof ChangedNodes> {
	addedNodes: Node[];
	removedNodes: Node[];
}

export type Observers = Map<Element, Observer>;
