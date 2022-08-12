/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { TreeParams } from 'core/component/directives/aria/roles-engines/tree/interface';
import { AriaRoleEngine, EngineOptions } from 'core/component/directives/aria/roles-engines/interface';

export class TreeEngine extends AriaRoleEngine {
	/**
	 * Engine params
	 */
	override params: TreeParams;

	constructor(options: EngineOptions<TreeParams>) {
		super(options);

		this.params = options.params;
	}

	/**
	 * Sets base aria attributes for current role
	 */
	init(): void {
		const
			{orientation, isRoot} = this.params;

		this.setRootRole();

		if (orientation === 'horizontal' && isRoot) {
			this.el.setAttribute('aria-orientation', orientation);
		}
	}

	/**
	 * Sets the role to the element depending on whether the tree is root or nested
	 */
	protected setRootRole(): void {
		this.el.setAttribute('role', this.params.isRoot ? 'tree' : 'group');
	}

	/**
	 * Handler: treeitem was expanded or closed
	 * @param el
	 * @param isFolded
	 */
	protected onChange(el: Element, isFolded: boolean): void {
		el.setAttribute('aria-expanded', String(!isFolded));
	}
}
