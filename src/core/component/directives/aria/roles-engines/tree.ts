/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import AriaRoleEngine, { DirectiveOptions } from 'core/component/directives/aria/interface';
import type { TreeBindingValue } from 'core/component/directives/aria/roles-engines/interface';

export default class TreeEngine extends AriaRoleEngine {
	$v: TreeBindingValue;
	el: HTMLElement;

	constructor(options: DirectiveOptions) {
		super(options);

		this.$v = options.binding.value;
		this.el = this.options.el;
	}

	init(): void {
		this.setRootRole();

		if (this.$v.isVertical) {
			this.el.setAttribute('aria-orientation', 'vertical');
		}
	}

	setRootRole(): void {
		this.el.setAttribute('role', this.$v.isRoot ? 'tree' : 'group');
	}

	onChange = (el: HTMLElement, isFolded: boolean): void => {
		el.setAttribute('aria-expanded', String(!isFolded));
	};
}
