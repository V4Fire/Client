'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import baseConfig from '@v4fire/core/src/config';

const
	$C = require('collection.js');

export default $C.extend(true, {}, baseConfig, CONFIG);
