/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import ComponentEngine from 'core/component';

import type { SafeOnElement } from 'components/directives/safe-on/interface';
import type { DirectiveBinding } from 'core/component/engines';

//#if runtime has dummyComponents
import('components/directives/safe-on/test/b-safe-on-dynamic-event-dummy');
//#endif

export * from 'components/directives/safe-on/interface';

ComponentEngine.directive('safe-on', {
	unmounted(el: SafeOnElement, {arg: eventName}: DirectiveBinding) {
		if (eventName == null) {
			return;
		}

		const eventHandler = el._vei?.[`on${eventName.camelize()}`];

		if (eventHandler != null) {
			el.removeEventListener(eventName, eventHandler);
		}
	}
});
