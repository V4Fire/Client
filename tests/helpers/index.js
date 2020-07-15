// @ts-check

/// <reference path="../../ts-definitions/tests.d.ts" />

const
	DOM = require('./dom'),
	BOM = require('./bom'),
	Utils = require('./utils'),
	Component = require('./component'),
	Router = require('./router');

/**
 * @typedef {import('playwright').Page} Page
 * @typedef {import('playwright').BrowserContext} BrowserContext
 * @typedef {import('playwright').ElementHandle} ElementHandle
 */

class Helpers {
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
}

module.exports = new Helpers();
module.exports.Helpers = Helpers;
