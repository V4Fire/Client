/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ControlsParams } from 'core/component/directives/aria/roles-engines/controls/interface';
import { AriaRoleEngine, EngineOptions } from 'core/component/directives/aria/roles-engines/interface';

export class ControlsEngine extends AriaRoleEngine {
	/**
	 * Engine params
	 */
	override params: ControlsParams;

	/**
	 * Engine params
	 */
	static override params: string[];

	constructor(options: EngineOptions<ControlsParams>) {
		super(options);

		this.params = options.params;
	}

	/**
	 * Sets base aria attributes for current role
	 */
	init(): void {
		const
			{ctx, modifiers, el} = this,
			{for: forId} = this.params;

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (forId == null) {
			Object.throw('Controls aria directive expects the id of controlling elements to be passed as "for" prop');
			return;
		}

		const
			isForPropArray = Object.isArray(forId),
			isForPropArrayOfTuples = isForPropArray && Object.isArray(forId[0]);

		if (modifiers != null && Object.size(modifiers) > 0) {
			ctx?.$nextTick().then(() => {
				const
					roleName = Object.keys(modifiers)[0],
					elems = el.querySelectorAll(`[role=${roleName}]`);

				if (isForPropArray && forId.length !== elems.length) {
					Object.throw('Controls aria directive expects prop "for" length to be equal to amount of elements with specified role or string type');
					return;
				}

				elems.forEach((el, i) => {
					if (Object.isString(forId)) {
						el.setAttribute('aria-controls', forId);
						return;
					}

					const
						id = forId[i];

					if (Object.isString(id)) {
						el.setAttribute('aria-controls', id);
					}
				});
			});

		} else if (isForPropArrayOfTuples) {
			forId.forEach((param) => {
				const
					[elId, controlsId] = param,
					element = el.querySelector(`#${elId}`);

				element?.setAttribute('aria-controls', controlsId);
			});
		}
	}
}
