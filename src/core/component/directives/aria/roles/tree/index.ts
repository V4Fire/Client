/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { TreeParams } from 'core/component/directives/aria/roles/tree/interface';
import { AriaRoleEngine } from 'core/component/directives/aria/roles/interface';

export class TreeEngine extends AriaRoleEngine {
	override Params: TreeParams = new TreeParams();

	/** @inheritDoc */
	init(): void {
		const
			{orientation, isRoot} = this.params;

		this.setRootRole();

		if (orientation === 'horizontal' && isRoot) {
			this.setAttribute('aria-orientation', orientation);
		}
	}

	/**
	 * Sets the role to the element depending on whether the tree is root or nested
	 */
	protected setRootRole(): void {
		this.setAttribute('role', this.params.isRoot ? 'tree' : 'group');
	}

	/**
	 * Handler: treeitem was expanded or closed
	 * @param el
	 * @param isExpanded
	 */
	protected onChange(el: Element, isExpanded: boolean): void {
		this.setAttribute('aria-expanded', String(isExpanded), el);
	}
}
