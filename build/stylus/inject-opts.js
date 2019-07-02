const
	$C = require('collection.js'),
	stylus = require('stylus');

const
	{config} = require('@pzlr/build-core');

let DS = {};

if (config.designSystem) {
	DS = require(config.designSystem);
}

function prepareData(data) {
	$C(data).forEach((d, val) => {
		if (/^#\d+/g.test(d)) {
			data[val] = new stylus.Parser(d).peek().val;
		}

		if (Object.isObject(d)) {
			prepareData(d);
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
	style.define('pInjection', ({string}) => DS[string] && stylus.utils.coerce(DS[string], true) || {});
};
