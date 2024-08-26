/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	minOnceEventNameLength = 'Once'.length + 'on'.length + 1,
	onceEventRgxp = /\bOnce\b/;

export const isOnceEvent = {
	test(event: string): boolean {
		if (event.length < minOnceEventNameLength || event.startsWith('on:')) {
			return false;
		}

		return event.endsWith('Once') || onceEventRgxp.test(event);
	},

	replace(event: string): string {
		return event.replace('Once', '');
	}
};

export const
	minDOMEventNameLength = Math.max('Passive'.length, 'Capture'.length) + 'on'.length + 1,
	domEventRgxp = /\b(Passive|Capture)\b/;

export const isDOMEvent = {
	test(event: string): boolean {
		if (event.length < minDOMEventNameLength || event.startsWith('on:')) {
			return false;
		}

		return event.endsWith('Passive') || event.endsWith('Capture') || domEventRgxp.test(event);
	}
};

/**
 * Checks if a given handler is a component event handler
 *
 * @param event - the event name to check
 * @param handler - the handler to check
 */
export function isComponentEventHandler(event: string, handler: unknown): handler is Function {
	if (!event.startsWith('on') || isDOMEvent.test(event) || !Object.isFunction(handler)) {
		return false;
	}

	return handler.name !== 'withModifiers' && handler.name !== 'withKeys';
}
