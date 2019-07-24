/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { EventEmitter2 as EventEmitter, Listener } from 'eventemitter2';
import { ComponentOptions, ComponentDriver } from 'core/component/engines';
import { ComponentMeta, ComponentParams } from 'core/component/interface';

export const
	initEvent = new EventEmitter({maxListeners: 1e3, newListener: false}),
	asyncLabel = Symbol('Component async label');

export const
	componentParams = new Map<Function | string, ComponentParams>(),
	rootComponents = Object.createDict<Promise<ComponentOptions<ComponentDriver>>>(),
	components = new Map<Function | string, ComponentMeta>();

((initEventOnce) => {
	initEvent.once = function (event: CanArray<string>, listener: Listener): EventEmitter {
		const
			events = (<string[]>[]).concat(event);

		for (let i = 0; i < events.length; i++) {
			const
				el = events[i],
				chunks = el.split('.');

			if (chunks[0] === 'constructor') {
				initEventOnce(el, listener);

				const
					p = componentParams.get(chunks[1]);

				if (p && Object.isObject(p.functional)) {
					initEventOnce(`${el}-functional`, listener);
				}

			} else {
				initEventOnce(el, listener);
			}
		}

		return this;
	};
})(initEvent.once.bind(initEvent));
