/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// @ts-check

const
	args = require('arg')({'--suit': String}, {permissive: true})

const
	s = JSON.stringify;

/**
 * Set of test cases
 */
const presets = {
	/**
	 * Set of parameters for rendering demo
	 */
	demo: [{
		attrs: {
			':theme': s('demo'),
			':option': s('div'),
			':dataProvider': s('demo.Pagination')
		},

		content: {}
	}],

	/**
	 * Set of parameters for rendering data test
	 */
	render: [{
		attrs: {
			':theme': s('demo'),
			':option': s('div'),
			':dataProvider': s('demo.Pagination')
		},

		content: {}
	}],

	/**
	 * Set of parameters for render truncated data
	 */
	renderTruncated: [{
		attrs: {
			':theme': s('demo'),
			':option': s('div'),
			':dataProvider': s('demo.Pagination'),
			':chunkSize': s(6),
			':optionProps': '({current}, i) => ({"data-index": current.i})',
			':dbConverter': '({data}) => ({data: data.splice(0, 12)})'
		}
	}],

	/**
	 * Set of parameters for render static data
	 */
	renderOptions: [{
		attrs: {
			':theme': s('demo'),
			':option': s('div'),
			':options': s(Array.from(Array(100), () => 'test')),
			':request': '{get: {chunkSize: 10}}'
		}
	}]
}

/** Current test or demo case */
let
	suit = 'demo';

if (args['--suit']) {
	suit = args['--suit'];
}

module.exports.presets = presets;
module.exports = presets[suit];
