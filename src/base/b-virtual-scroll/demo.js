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
	 * Set of parameters to render demo
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
	 * Set of parameters to render data
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
	 * Set of parameters to render truncated data
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
	 * Set of parameters to render static data
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
	 * Set of parameters to render the empty slot
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
};

module.exports = suits;
