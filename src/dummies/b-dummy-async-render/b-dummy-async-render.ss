- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'super/i-data'|b as placeholder

- template index() extends ['i-data'].index
	- block body
		< .&__infinite-rendering
			< template v-for = el in asyncRender.iterate(true, { &
				filter: asyncRender.waitForceRender('infinite-rendering-wrapper')
			}) .
				< .&__infinite-rendering-wrapper
					Element: {{ String(el) }}; Hook: {{ hook }}; {{ '' }}

		< button.&__infinite-rendering-btn @click = asyncRender.forceRender()
			Force render

		< button.&__infinite-rendering-defer-btn @click = asyncRender.deferForceRender()
			Defer force render

		: cases = [ &
			['simple-array-rendering', '[1, 2, 3, 4]'],
			['array-rendering-with-chunk-size', '[1, 2, 3, 4], 3'],
			['array-rendering-with-start-and-chunk-size', '[1, 2, 3, 4], [1, 2]'],
			['simple-object-rendering', '{a: 1, b: 2}'],
			['object-rendering-with-start', '{a: 1, b: 2}, [1]'],
			['simple-string-rendering', '"1😃à🇷🇺"'],
			['simple-iterable-rendering', 'new Set([1, 2]).values()'],
			['range-rendering-with-filter', '4, {filter: (el) => el % 2 === 0}'],
			['range-rendering-with-raf', '2, {useRaf: true}'],
			['nullish-rendering', 'null'],
			['range-rendering-by-click', '1', 'by-click'],
			['iterable-with-promises-rendering-by-click', '[async.sleep(100).then(() => 1), async.sleep(50).then(() => 2)]', 'by-click'],
			['promise-with-iterable-rendering-by-click', 'async.sleep(100).then(() => [1, 2])', 'by-click'],
			['promise-with-nullish-rendering-by-click', 'async.sleep(100)', 'by-click']
		] .

		- forEach cases => el
			{el[0]}

			- if el[2] === 'by-click'
				< .&__${el[0]}
					< template v-for = el in asyncRender.iterate(${el[1]}, { &
						filter: (el, i) => tmp['${el[0]}'] || promisifyOnce('${el[0]}')
					}) .
						Element: {{ String(el) }}; Hook: {{ hook }}; {{ '' }}

				< button.&__${el[0]}-btn @click = tmp['${el[0]}']=true, emit('${el[0]}')
					{el[0]}

			- else
				< .&__${el[0]}
					< template v-for = el in asyncRender.iterate(${el[1]})
						Element: {{ String(el) }}; Hook: {{ hook }}; {{ '' }}

			< hr
