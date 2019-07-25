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
			if (/^#\d+/g.test(d)) {
				data[val] = new stylus.Parser(d).peek().val;

			} else if (/^[a-z-_]+\(.*\)$/.test(d)) {
				data[val] = new stylus.Parser(d).function();
			}
		}
	});
}

prepareData(DS);

module.exports = function (style) {
	/**
	 * Injects additional options to a block options dict ($p)
	 *
	 * @param component
	 * @param file
	 */
	style.define(
		'pInjection',
		({string}) => DS.components && DS.components[string] && stylus.utils.coerce(DS.components[string], true) || {}
	);
};
