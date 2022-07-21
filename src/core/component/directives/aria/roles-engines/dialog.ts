/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iOpen from 'traits/i-open/i-open';
import AriaRoleEngine from 'core/component/directives/aria/interface';
import type { DirectiveOptions } from 'core/component/directives/aria/interface';

export default class DialogEngine extends AriaRoleEngine {
	constructor(options: DirectiveOptions) {
		super(options);

		if (!iOpen.is(options.vnode.fakeContext)) {
			Object.throw('Dialog aria directive expects the component to realize iOpen interface');
		}
	}

	init(): void {
		const
			{el} = this.options;

		el.setAttribute('role', 'dialog');
		el.setAttribute('aria-modal', 'true');
	}
}
