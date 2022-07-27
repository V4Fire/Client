/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import AriaRoleEngine, { DirectiveOptions } from 'core/component/directives/aria/interface';
import type { TreeParams } from 'core/component/directives/aria/roles-engines/interface';

export default class TreeEngine extends AriaRoleEngine {
	/**
	 * Passed directive params
	 */
	params: TreeParams;

	constructor(options: DirectiveOptions) {
		super(options);

		this.params = options.binding.value;
	}

	/**
	 * Sets base aria attributes for current role
	 */
	init(): void {
		const
			{el} = this.options;

		this.setRootRole();

		if (this.params.isVertical) {
			el.setAttribute('aria-orientation', 'vertical');
		}
	}

	/**
	 * Sets the role to the element depending on whether the tree is root or nested
	 */
	protected setRootRole(): void {
		const
			{el} = this.options;

		el.setAttribute('role', this.params.isRoot ? 'tree' : 'group');
	}

	/**
	 * Handler: treeitem was expanded or closed
	 * @param el
	 * @param isFolded
	 */
	protected onChange(el: HTMLElement, isFolded: boolean): void {
		el.setAttribute('aria-expanded', String(!isFolded));
	}
}
