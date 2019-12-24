/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock, { ModsDecl } from 'super/i-block/i-block';

export interface HistoryItem {
	stage: string;
	options: CanUndef<Dictionary>
}

export default class History<T extends iBlock> {
	/**
	 * Open modifiers
	 */
	static readonly mods: ModsDecl = {
		turning: [
			'true'
		]
	};

	/**
	 * Context for functions
	 */
	protected readonly component: T;

	/**
	 * Transitions stack
	 */
	protected stackStore: HistoryItem[] = [];

	/**
	 * @param component
	 */
	constructor(component: T) {
		this.component = component;
	}

	/**
	 * Current stack position
	 */
	get current(): Readonly<HistoryItem> {
		return this.stackStore[this.stackStore.length - 1];
	}

	/**
	 * Public stack
	 */
	get stack(): ReadonlyArray<HistoryItem> {
		return Object.freeze(this.stackStore);
	}

	/**
	 * Page count at the history
	 */
	get length(): number {
		return this.stackStore.length;
	}

	/**
	 * Adds the component stage to the stack
	 *
	 * @param stage
	 * @param [options]
	 */
	push(stage: string, options?: Dictionary): void {
		const
			page = this.component.$el.querySelector(`[data-page=${stage}]`);

		if (page) {
			this.component.setMod(page, 'turning', true);
			this.stackStore.push({stage, options});
		}
	}

	/**
	 * Navigates back through history
	 */
	back(): CanUndef<HistoryItem> {
		return this.stackStore.pop();
	}
}
