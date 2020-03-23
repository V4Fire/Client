/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export const
	cacheStatus = Symbol('Cache status'),
	toWatcher = Symbol('Link to a watcher object'),
	toComponent = Symbol('Link to a component object'),
	ignoreLabel = Symbol('Ignore label');

export const
	customWatcherRgxp = /^([!?]?)([^!?:]*):(.*)/;
