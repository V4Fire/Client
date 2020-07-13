/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Async from 'core/async';

export const
	suspendRgxp = /:suspend(?:\b|$)/,
	asyncNames = Async.linkNames;

export const inactiveStatuses = Object.createDict({
	destroyed: true,
	inactive: true
});

export const readyStatuses = Object.createDict({
	beforeReady: true,
	ready: true
});

export const nonMuteAsyncLinkNames = Object.createDict({
	[asyncNames.promise]: true,
	[asyncNames.request]: true
});
