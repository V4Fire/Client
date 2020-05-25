/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	s = JSON.stringify;

const baseAttrs = {
	':theme': s('demo'),
	':option': s('div'),
	':optionProps': '({current}, i) => ({"data-index": current.i})',
};

const slots = {
	tombstone: '<div class="b-virtual-scroll__skeleton">Skeleton</div>',
	retry: '<button id="retry">Повторить</button>',
	empty: '<div id="empty">Здесь пусто</div>'
};

const baseContent = {
	tombstone: slots.tombstone
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
	 * Set of parameters for rendering truncated data
	 */
	renderTruncated: [{
		attrs: {
			...baseAttrs,
			':dataProvider': s('demo.Pagination'),
			':dbConverter': '({data}) => ({data: data.splice(0, 4)})',
			':request': '{get: {chunkSize: 8, total: 32, id: "b-virtual:render-truncated"}}'
		},

		content: {
			...baseContent
		}
	}],

	/**
	 * Set of parameters for rendering static data
	 */
	renderOptions: [{
		attrs: {
			...baseAttrs,
			':options': s(Array.from(Array(97), (v, i) => ({i})))
		},

		content: {
			...baseContent
		}
	}],

	/**
	 * Set of parameters for rendering empty slot
	 */
	slotEmpty: [{
		attrs: {
			...baseAttrs,
			':dataProvider': s('demo.Pagination'),
			':dbConverter': '({data}) => ({data: []})'
		},

		content: {
			...baseContent,
			empty: slots.empty
		}
	}]
}

module.exports = suits;
