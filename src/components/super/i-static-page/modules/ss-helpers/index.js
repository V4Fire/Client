/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

/**
 * [[include:components/super/i-static-page/modules/ss-helpers/README.md]]
 * @packageDocumentation
 */

Object.assign(
	exports,
	include('src/components/super/i-static-page/modules/ss-helpers/helpers'),
	include('src/components/super/i-static-page/modules/ss-helpers/tags'),
	include('src/components/super/i-static-page/modules/ss-helpers/libs'),
	include('src/components/super/i-static-page/modules/ss-helpers/page'),
	include('src/components/super/i-static-page/modules/ss-helpers/assets'),
	include('src/components/super/i-static-page/modules/ss-helpers/favicons'),
	include('src/components/super/i-static-page/modules/ss-helpers/base-declarations')
);
