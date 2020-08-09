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
	':option': s('section'),
	':optionProps': '({current}, i) => ({"data-index": current.i})'
};

const slots = {
	tombstone: '<div class="b-virtual-scroll__skeleton" data-test-ref="skeleton">Skeleton</div>',
	retry: '<button id="retry" data-test-ref="retry">Repeat</button>',
	empty: '<div id="empty" data-test-ref="empty">Empty</div>',
	done: '<div id="done" data-test-ref="done">Done</div>',
	loader: '<div id="loader" data-test-ref="loader">Loader</div>'
};

const suits = {
	/*
	 * Slots
	 */
	'slots/empty': [
			{
				attrs: {
					...baseAttrs,
					':dataProvider': s('demo.Pagination'),
					':dbConverter': '({data}) => ({data: data.splice(0, 4)})',
					id: 'noSlot'
				}
			},
			{
				attrs: {
					...baseAttrs,
					':dataProvider': s('demo.Pagination'),
					':dbConverter': '({data}) => ({data: data.splice(0, 4)})',
					':request': '{get: {chunkSize: 8, total: 8}}',
					id: 'withData'
				},

				content: {
					empty: slots.empty
				}
			},
			{
				attrs: {
					...baseAttrs,
					':dataProvider': s('demo.Pagination'),
					':dbConverter': '({data}) => ({data: []})',
					id: 'withSlot'
				},

				content: {
					empty: slots.empty
				}
			}
	],

	render: [
		{
			attrs: {
				...baseAttrs,
				id: 'target'
			}
		}
	]
};

module.exports = suits;
