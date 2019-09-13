/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock, { component, system, wait, prop } from 'super/i-block/i-block';
export * from 'super/i-block/i-block';

@component()
export default class bV4ComponentDemo extends iBlock {
	/**
	 * Dictionary with prop names and modifiers for highlighting
	 */
	@prop({type: Object, required: false})
	readonly highlighting?: Dictionary;

	/**
	 * Debug component
	 */
	@system()
	protected debugComponent?: iBlock;

	/**
	 * Starts debugging the specified component
	 * @param component
	 */
	debug(component: iBlock): void {
		this.stage = `debug-${component.globalName}`;
		this.debugComponent = component;
	}

	/**
	 * Returns normalized modifier value from the specified
	 * @param value
	 */
	protected getModValue(value: CanArray<unknown>): CanUndef<string> {
		const
			res = Object.isArray(value) ? value[0] : value;

		if (res === undefined) {
			return <undefined>res;
		}

		return String(res);
	}

	/**
	 * Sets a modifier for the debug component
	 *
	 * @param el
	 * @param mod
	 * @param value
	 */
	@wait('ready')
	protected setDebugMod(el: Element, mod: string, value: string): CanPromise<void> {
		if (!this.debugComponent) {
			return;
		}

		this.debugComponent.setMod(mod, value);

		const
			parent = el.parentElement;

		if (!parent) {
			return;
		}

		for (let o = Array.from(parent.children), i = 0; i < o.length; i++) {
			const c = o[i];
			this.block.setElMod(c, 'modValue', 'selected', c === el);
		}
	}

	/**
	 * Returns a list of debug component parents
	 */
	protected getDebugParents(): string[] {
		const
			res = <string[]>[];

		if (!this.debugComponent) {
			return res;
		}

		let
			// @ts-ignore
			parent = this.debugComponent.meta.parentMeta;

		while (parent) {
			res.push(parent.componentName);
			parent = parent.parentMeta;
		}

		return res;
	}
}
