/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */
import log from 'core/log';
import ComponentEngine from 'core/component';

import type { SafeOnDirectiveParams, SafeOnElement, SafeOnEventType } from 'components/directives/safe-on/interface';

//#if runtime has dummyComponents
import('components/directives/safe-on/test/b-safe-on-dynamic-event-dummy');
//#endif

export * from 'components/directives/safe-on/interface';

const
	logger = log.namespace('v-safe-on'),
	safeOnMapKey = '[[SAFE_ON]]';

ComponentEngine.directive('safe-on', {
	mounted(el: SafeOnElement, binding: SafeOnDirectiveParams) {
		const {eventType, handler} = validateBinding(binding);

		if (eventType == null || handler == null) {
			return;
		}

		addEventListener(el, eventType, handler);
	},

	updated(el: SafeOnElement, binding: SafeOnDirectiveParams) {
		const {eventType, handler} = validateBinding(binding);

		if (eventType == null || handler == null) {
			return;
		}

		if (el[safeOnMapKey]?.has(handler)) {
			const {eventType: oldEventType} = el[safeOnMapKey].get(handler)!;

			if (oldEventType === eventType) {
				return;
			}

			removeEventListener(el, handler);
		}

		addEventListener(el, eventType, handler);
	},

	unmounted(el: SafeOnElement, binding: SafeOnDirectiveParams) {
		const handler = binding.value;

		if (typeof handler !== 'function') {
			return;
		}

		removeEventListener(el, handler);
	}
});

function addEventListener(el: SafeOnElement, eventType: SafeOnEventType, handler: SafeOnDirectiveParams['value']) {
	if (el[safeOnMapKey] == null) {
		el[safeOnMapKey] = new WeakMap();
	}

	el[safeOnMapKey].set(handler, {fn: handler, eventType});
	el.addEventListener(eventType, handler);
}

function removeEventListener(el: SafeOnElement, handler: Function): void {
	if (!(el[safeOnMapKey]?.has(handler))) {
		return;
	}

	const {eventType, fn} = el[safeOnMapKey].get(handler)!;
	el.removeEventListener(eventType, fn);
	el[safeOnMapKey].delete(handler);
}

function validateBinding(binding: SafeOnDirectiveParams): {
	eventType?: SafeOnEventType;
	handler?: SafeOnDirectiveParams['value'];
} {
	const eventType = binding.arg;
	const handler = binding.value;

	if (Object.size(eventType) === 0) {
		logger.error('Event type is not specified');
		return {eventType: undefined, handler: undefined};
	}

	if (typeof handler !== 'function') {
		logger.error(`Expecting a function, got ${typeof handler}`);
		return {eventType, handler: undefined};
	}

	return {eventType, handler};
}
