'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * This module provides a promise that should resolve before initialize of the WebPack config.
 * You can use it to initialize some modules before WebPack.
 */
module.exports = Promise.resolve();
