/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// @ts-check

/// <reference path="../../ts-definitions/tests.d.ts" />

const
	DOM = require('./dom'),
	BOM = require('./bom'),
	Utils = require('./utils'),
	Component = require('./component'),
	Scroll = require('./scroll'),
	Router = require('./router'),
	Request = require('./request');

class Helpers {
	/** @see Request */
	request = new Request(this);

	/** @see Utils */
	utils = new Utils(this);

	/** @see Component */
	component = new Component(this);

	/** @see BOM */
	bom = new BOM(this);

	/** @see Router */
	router = new Router(this);

	/** @see DOM */
	dom = new DOM(this);

	/** @see Scroll */
	scroll = new Scroll(this);
}

module.exports = new Helpers();
module.exports.Helpers = Helpers;
