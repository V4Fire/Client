/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Async from '@src/core/async';

export const
	suspendRgxp = /:suspend(?:\b|$)/,
	asyncNames = Async.linkNames;

export const inactiveStatuses: Dictionary<boolean> = Object.createDict({
	destroyed: true,
	inactive: true
});

export const readyStatuses: Dictionary<boolean> = Object.createDict({
	inactive: true,
	beforeReady: true,
	ready: true
});

export const nonMuteAsyncLinkNames: Dictionary<boolean> = Object.createDict({
	[asyncNames.promise]: true,
	[asyncNames.request]: true
});
