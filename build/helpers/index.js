/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

Object.assign(
	exports,
	include('@super/build/helpers', __dirname),
	include('build/helpers/webpack'),
	include('build/helpers/other'),
	include('build/helpers/i18n'),
	include('build/helpers/tracer'),
	include('build/helpers/invoke-by-register-component'),
	include('build/helpers/layer-name'),
	include('build/helpers/get-origin-layer')
);
