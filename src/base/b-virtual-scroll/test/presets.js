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
	 * Set of parameters for rendering data test
	 * Run test with suit render
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
	 * Run test with suit render
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
	 * Run test with suit render-truncated
	 */
	renderTruncated: [{
		attrs: {
			':theme': s('demo'),
			':option': s('div'),
			':dataProvider': s('demo.Pagination'),
			':dbConverter': '({data}) => ({data: data.splice(0, 5)})'
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
