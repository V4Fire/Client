/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export const
	toWatcherObject = Symbol('Link to a watcher object'),
	toComponentObject = Symbol('Link to a component object');

export const
	cacheStatus = Symbol('Cache status'),
	fakeCopyLabel = Symbol('Fake copy label');

export const
	customWatcherRgxp = /^([!?]?)([^!?:]*):(.*)/;
