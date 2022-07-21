/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import AriaRoleEngine from 'core/component/directives/aria/interface';

export default class ControlsEngine extends AriaRoleEngine {
	init(): void {
		const
			{vnode, binding, el} = this.options,
			{fakeContext: ctx} = vnode;

		if (binding.modifiers == null) {
			Object.throw('Controls aria directive expects the role modifier to be passed');
			return;
		}

		if (binding.value?.controls == null) {
			Object.throw('Controls aria directive expects the controls value to be passed');
			return;
		}

		const
			roleName = Object.keys(binding.modifiers)[0];

		ctx?.$nextTick().then(() => {
			const
				elems = el.querySelectorAll(`[role=${roleName}]`);

			for (let i = 0; i < elems.length; i++) {
				const
					elem = elems[i],
					{id} = binding.value;

				elem.setAttribute('aria-controls', id);
			}
		});
	}
}
