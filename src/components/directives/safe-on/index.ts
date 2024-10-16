/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */
import log from 'core/log';
import ComponentEngine from 'core/component';

import type { SafeOnDirectiveParams } from 'components/directives/safe-on/interface';
import type { VNode } from 'core/component/engines';

//#if runtime has dummyComponents
import('components/directives/safe-on/test/b-safe-on-dynamic-event-dummy');
//#endif

export * from 'components/directives/safe-on/interface';

const logger = log.namespace('v-safe-on');

ComponentEngine.directive('safe-on', {
	mounted(el: Element, binding: SafeOnDirectiveParams, vnode: VNode) {
		const {eventType, handler} = validateBinding(binding);

		if (eventType == null || handler == null) {
			return;
		}

		const ctx = vnode.virtualParent?.value?.unsafe;

		addEventListener(el, eventType, handler);

		ctx?.meta.hooks.beforeDestroy.push({
			fn: () => removeEventListener(el, eventType)
		});
	},

	updated(el: Element, binding: SafeOnDirectiveParams) {
		const {eventType, handler} = validateBinding(binding);

		if (eventType == null || handler == null) {
			return;
		}

		if (
			el['[[SAFE_ON_EVENT_TYPE]]'] === eventType &&
			el['[[SAFE_ON_HANDLER]]'] === handler
		) {
			return;
		}

		if (el['[[SAFE_ON_EVENT_TYPE]]'] != null) {
			removeEventListener(el, el['[[SAFE_ON_EVENT_TYPE]]']);
		}

		addEventListener(el, eventType, handler);
	},

	unmounted(el: Element, binding: SafeOnDirectiveParams) {
		const eventType = binding.arg;

		if (Object.size(eventType) === 0) {
			return;
		}

		removeEventListener(el, eventType!);
	}
});

function addEventListener(el: Element, eventType: string, handler: SafeOnDirectiveParams['value']) {
	el['[[SAFE_ON_HANDLER]]'] = handler;
	el['[[SAFE_ON_EVENT_TYPE]]'] = eventType;

	el.addEventListener(eventType, el['[[SAFE_ON_HANDLER]]']);
}

function removeEventListener(el: Element, eventType: string) {
	if (el['[[SAFE_ON_HANDLER]]'] != null) {
		el.removeEventListener(eventType, el['[[SAFE_ON_HANDLER]]']);

		delete el['[[SAFE_ON_HANDLER]]'];
		delete el['[[SAFE_ON_EVENT_TYPE]]'];
	}
}

function validateBinding(binding: SafeOnDirectiveParams): { eventType?: string; handler?: SafeOnDirectiveParams['value'] } {
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
