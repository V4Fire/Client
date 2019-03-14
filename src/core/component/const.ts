/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { EventEmitter2 as EventEmitter, Listener } from 'eventemitter2';
import { ComponentOptions, ComponentDriver } from 'core/component/engines';
import { ComponentMeta } from 'core/component/interface';

export const
	initEvent = new EventEmitter({maxListeners: 1e3, newListener: false});

export const
	rootComponents = Object.createDict<Promise<ComponentOptions<ComponentDriver>>>(),
	localComponents = new WeakMap<Function, ComponentMeta>(),
	components = new Map<Function | string, ComponentMeta>();

((initEventOnce) => {
	initEvent.once = function (event: CanArray<string>, listener: Listener): EventEmitter {
		const
			events = (<string[]>[]).concat(event);

		for (let i = 0; i < events.length; i++) {
			const
				el = events[i];

			if (el === 'constructor') {
				initEventOnce(el, (obj) => {
					listener(obj);

					if (!Object.isBoolean(obj.meta.params.functional)) {
						initEventOnce(el, listener);
					}
				});

			} else {
				initEventOnce(el, listener);
			}
		}

		return this;
	};
})(initEvent.once.bind(initEvent));
