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
import { isOptionsModifier, modifierGuards } from 'components/directives/safe-on/helpers';

//#if runtime has dummyComponents
import('components/directives/safe-on/test/b-safe-on-dynamic-event-dummy');
//#endif

export * from 'components/directives/safe-on/interface';

const
	logger = log.namespace('v-safe-on'),
	safeOnMapKey = '[[SAFE_ON]]';

ComponentEngine.directive('safe-on', {
	mounted(el: SafeOnElement, binding: SafeOnDirectiveParams) {
		const {eventType, rawHandler, invoker, options} = validateBinding(binding);

		if (eventType == null || rawHandler == null || invoker == null) {
			return;
		}

		addEventListener(el, eventType, rawHandler, invoker, options);
	},

	updated(el: SafeOnElement, binding: SafeOnDirectiveParams) {
		const {eventType, rawHandler, invoker, options} = validateBinding(binding);

		if (eventType == null || rawHandler == null || invoker == null) {
			return;
		}

		if (el[safeOnMapKey]?.has(rawHandler)) {
			const {eventType: oldEventType} = el[safeOnMapKey].get(rawHandler)!;

			if (oldEventType === eventType) {
				return;
			}

			removeEventListener(el, rawHandler);
		}

		addEventListener(el, eventType, rawHandler, invoker, options);
	},

	unmounted(el: SafeOnElement, binding: SafeOnDirectiveParams) {
		const rawHandler = binding.value;

		if (typeof rawHandler !== 'function') {
			return;
		}

		removeEventListener(el, rawHandler);
	}
});

/**
 * Adds an event listener to the specified element
 *
 * @param el - the element to which the event listener will be added
 * @param eventType - the type of the event to listen for
 * @param rawHandler - the original event handler function
 * @param invoker - the invoker function that wraps the raw handler
 * @param options - optional options for the event listener
 */
function addEventListener(
	el: SafeOnElement,
	eventType: SafeOnEventType,
	rawHandler: SafeOnDirectiveParams['value'],
	invoker: SafeOnDirectiveParams['value'],
	options?: AddEventListenerOptions
): void {
	if (el[safeOnMapKey] == null) {
		el[safeOnMapKey] = new WeakMap();
	}

	el[safeOnMapKey].set(rawHandler, {fn: invoker, eventType});
	el.addEventListener(eventType, invoker, options);
}

/**
 * Removes an event listener from the specified element
 *
 * @param el - the element from which the event listener will be removed
 * @param rawHandler - the original event handler function
 */
function removeEventListener(el: SafeOnElement, rawHandler: SafeOnDirectiveParams['value']): void {
	if (!(el[safeOnMapKey]?.has(rawHandler))) {
		return;
	}

	const {eventType, fn} = el[safeOnMapKey].get(rawHandler)!;
	el.removeEventListener(eventType, fn);
	el[safeOnMapKey].delete(rawHandler);
}

/**
 * Validates the binding object and extracts necessary properties
 *
 * @param binding - the binding object containing directive parameters
 */
function validateBinding(binding: SafeOnDirectiveParams): {
	eventType?: SafeOnEventType;
	rawHandler?: SafeOnDirectiveParams['value'];
	invoker?: SafeOnDirectiveParams['value'];
	options?: AddEventListenerOptions;
} {
	const {arg: eventType, value: rawHandler, modifiers} = binding;

	if (Object.size(eventType) === 0) {
		logger.error('Event type is not specified');
		return {eventType: undefined, rawHandler: undefined};
	}

	if (typeof rawHandler !== 'function') {
		logger.error(`Expecting a function, got ${typeof rawHandler}`);
		return {eventType, rawHandler: undefined};
	}

	const truthyGuardModifiers = Object.keys(modifiers).filter((key) => Boolean(modifiers[key]));
	const invoker = createInvoker(rawHandler, truthyGuardModifiers);

	const options = createEventOptions(modifiers);

	return {eventType, rawHandler, invoker, options};
}

/**
 * Creates an invoker function that wraps the raw handler with guard checks
 *
 * @param rawHandler - the original event handler function
 * @param guardModifiers - an array of truthy guard modifiers
 */
function createInvoker(rawHandler: SafeOnDirectiveParams['value'], guardModifiers: string[]): (e: Event) => void {
	return (e: Event): void => {
		for (const modifier of guardModifiers) {
			const guard = modifierGuards[modifier];

			if (guard?.(e, guardModifiers) === true) {
				return;
			}
		}

		rawHandler(e);
	};
}

function createEventOptions(modifiers: SafeOnDirectiveParams['modifiers']): AddEventListenerOptions {
	return Object.keys(modifiers).reduce((map, key) => {
		if (isOptionsModifier(key)) {
			map[key] = modifiers[key];
		}

		return map;
	}, {});
}
