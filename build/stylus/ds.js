const
	$C = require('collection.js'),
	stylus = require('stylus');

const
	{config} = require('@pzlr/build-core');

let DS = {};

if (config.designSystem) {
	DS = require(config.designSystem);

} else {
	console.log('[stylus] Design system package is not specified');
}

function prepareData(data) {
	$C(data).forEach((d, val) => {
		if (Object.isObject(d) || Object.isArray(d)) {
			prepareData(d);

		} else {
			if (/^[a-z-_]+\(.*\)$/.test(d)) {
				// Built-in function
				data[val] = new stylus.Parser(d).function();

			} else if (/^#(?=[0-9a-fA-F]*$)(?:.{3,4}|.{6}|.{8})$/.test(d)) {
				// HEX value
				data[val] = new stylus.Parser(d).peek().val;
			}

			if (d === 'none') {
				data[val] = new stylus.Parser(d).peek().val;
			}
		}
	});
}

prepareData(DS);

module.exports = function (style) {
	/**
	 * Injects additional options to a block options dict ($p)
	 *
	 * @param {string} string - component name
	 * @returns {!Object}
	 */
	style.define(
		'injector',
		({string}) => DS.components && DS.components[string] && stylus.utils.coerce(DS.components[string], true) || {}
	);

	/**
	 * Returns part of the DS
	 *
	 * @param {string} string - DS field name
	 * @returns {!Object}
	 */
	style.define(
		'getDSOptions',
		({string}) => DS[string] && stylus.utils.coerce(DS[string], true) || {}
	);
};
