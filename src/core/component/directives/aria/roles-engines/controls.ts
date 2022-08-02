/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import AriaRoleEngine from 'core/component/directives/aria/interface';

export default class ControlsEngine extends AriaRoleEngine {
	/**
	 * Sets base aria attributes for current role
	 */
	init(): void {
		const
			{vnode, binding, el} = this.options,
			{modifiers, value} = binding,
			{fakeContext: ctx} = vnode;

		if (value?.for == null) {
			Object.throw('Controls aria directive expects the id of controlling elements to be passed as "for" prop');
			return;
		}

		const
			isForPropArray = Object.isArray(value.for),
			isForPropArrayOfTuples = Object.isArray(value.for) && Object.isArray(value.for[0]);

		if (modifiers != null && Object.size(modifiers) > 0) {
			ctx?.$nextTick().then(() => {
				const
					roleName = Object.keys(modifiers)[0],
					elems = el.querySelectorAll(`[role=${roleName}]`);

				if (isForPropArray && value.for.length !== elems.length) {
					Object.throw('Controls aria directive expects prop "for" length to be equal to amount of elements with specified role or string type');
					return;
				}

				elems.forEach((el, i) => {
					el.setAttribute('aria-controls', isForPropArray ? value.for[i] : value.for);
				});
			});

		} else if (isForPropArrayOfTuples) {
			value.for.forEach(([elId, controlsId]) => {
				const element = el.querySelector(`#${elId}`);

				element?.setAttribute('aria-controls', controlsId);
			});
		}
	}
}
