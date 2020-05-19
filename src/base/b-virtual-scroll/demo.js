/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// @ts-check

const
	s = JSON.stringify;

const baseAttrs = {
	':theme': s('demo'),
	':option': s('div'),
	':optionProps': '({current}, i) => ({"data-index": current.i})',
};

const baseContent = {
	tombstone: '<div class="b-virtual-scroll__skeleton">Skeleton</div>'
};

const suits = {
	/**
	 * Set of parameters for rendering demo
	 */
	demo: [{
		attrs: {
			...baseAttrs,
			':dataProvider': s('demo.Pagination')
		},

		content: {
			...baseContent
		}
	}],

	/**
	 * Set of parameters for rendering data test
	 */
	render: [{
		attrs: {
			...baseAttrs,
			':dataProvider': s('demo.Pagination')
		},

		content: {
			...baseContent
		}
	}],

	/**
	 * Set of parameters for render truncated data
	 */
	renderTruncated: [{
		attrs: {
			...baseAttrs,
			':dataProvider': s('demo.Pagination'),
			':chunkSize': '10',
			':dbConverter': '({data}) => ({data: data.splice(0, 4)})',
			':request': '{get: {chunkSize: 8, total: 32, id: "render-truncated-virtual"}}'
		},

		content: {
			...baseContent
		}
	}],

	/**
	 * Set of parameters for render static data
	 */
	renderOptions: [{
		attrs: {
			...baseAttrs,
			':options': s(Array.from(Array(97), (v, i) => ({i})))
		},

		content: {
			...baseContent
		}
	}]
}

module.exports = suits;
