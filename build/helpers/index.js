'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

Object.assign(
	exports,
	include('@super/build/helpers', __dirname),
	include('build/helpers/test'),
	include('build/helpers/webpack'),
	include('build/helpers/other')
);
