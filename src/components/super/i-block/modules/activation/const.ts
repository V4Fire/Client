/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { Namespaces } from 'core/async';

export const suspendRgxp = /:suspend(?:\b|$)/;

export const inactiveStatuses: Dictionary<boolean> = Object.createDict({
	destroyed: true,
	inactive: true
});

export const readyStatuses: Dictionary<boolean> = Object.createDict({
	inactive: true,
	beforeReady: true,
	ready: true
});

export const nonMuteAsyncNamespaces: Dictionary<boolean> = Object.createDict({
	[Namespaces.promise]: true,
	[Namespaces.request]: true
});
