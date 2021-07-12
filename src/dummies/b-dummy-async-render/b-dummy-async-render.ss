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
		< template v-if = stage === 'infinite rendering'
			< .&__result
				< template v-for = el in asyncRender.iterate(true, { &
					filter: asyncRender.waitForceRender('wrapper')
				}) .
					< .&__wrapper
						Element: {{ String(el) }}; Hook: {{ hook }}; {{ '' }}

			< button.&__force @click = asyncRender.forceRender()
				Force render

			< button.&__defer-force @click = asyncRender.deferForceRender()
				Defer force render

		< template v-if = stage === 'infinite rendering with providing a function'
			< .&__result
				< template v-for = el in asyncRender.iterate(true, { &
					filter: asyncRender.waitForceRender((ctx) => ctx.$el.querySelector('.wrapper'))
				}) .
					< .wrapper
						Element: {{ String(el) }}; Hook: {{ hook }}; {{ '' }}

			< button.&__force @click = asyncRender.forceRender()
				Force render

			< button.&__defer-force @click = asyncRender.deferForceRender()
				Defer force render

		< template v-if = stage === 'deactivating/activating the parent component while rendering'
			< .&__result
				< template v-for = el in asyncRender.iterate(2, { &
					filter: async.sleep.bind(async, 200)
				}) .
					Element: {{ String(el) }}; Hook: {{ hook }}; {{ '' }}

			< button.&__deactivate @click = deactivate()
				Deactivate

			< button.&__activate @click = activate()
				Activate

		< template v-if = stage === 'updating the parent component state'
			< .&__result
				{{ void(tmp.oldRefs = $refs.btn) }}

				< template v-for = el in asyncRender.iterate(2)
					< b-button ref = btn | v-func = false
						< template #default = {ctx}
							Element: {{ el }}; Hook: {{ ctx.hook }};

			< button.&__update @click = watchTmp.foo=Math.random()
				Update state

		< template v-if = stage === 'clearing by the specified group name'
			< .&__result
				< template v-for = el in asyncRender.iterate(2, { &
					group: 'foo'
				}) .
					Element: {{ String(el) }}; Hook: {{ hook }}; {{ '' }}

			< button.&__update @click = watchTmp.foo=Math.random()
				Update state

			< button.&__clear @click = async.clearAll({group: /foo/})
				Clear

		< template v-if = stage === 'loading dynamic modules'
			< .&__result
				+= self.loadModules('form/b-button')
					< b-button
						Ok 1

				+= self.loadModules(['form/b-button'], {wait: 'async.sleep.bind(async, 300)'})
					< b-button
						Ok 2

		: cases = [ &
			['simple array rendering', '[1, 2, 3, 4]'],
			['array rendering with specifying a chunk size', '[1, 2, 3, 4], 3'],
			['array rendering with specifying a start position and chunk size', '[1, 2, 3, 4], [1, 2]'],
			['simple object rendering', '{a: 1, b: 2}'],
			['object rendering with specifying a start position', '{a: 1, b: 2}, [1]'],
			['simple string rendering', '"1😃à🇷🇺"'],
			['simple iterable rendering', 'new Set([1, 2]).values()'],
			['range rendering with specifying a filter', '4, {filter: (el) => el % 2 === 0}'],
			['range rendering with `useRAF`', '2, {useRaf: true}'],
			['nullish rendering', 'null'],
			['range rendering by click', '1', 'by click'],
			['iterable with promises rendering by click', '[async.sleep(100).then(() => 1), async.sleep(50).then(() => 2)]', 'by click'],
			['promise with iterable rendering by click', 'async.sleep(100).then(() => [1, 2])', 'by click'],
			['promise with nullish rendering by click', 'async.sleep(100)', 'by click']
		] .

		- forEach cases => el
			< template v-if = stage === '${el[0]}'
				- if el[2] === 'by click'
					< .&__result
						< template v-for = el in asyncRender.iterate(${el[1]}, { &
							filter: (el, i) => tmp[stage] || promisifyOnce(stage)
						}) .
							Element: {{ String(el) }}; Hook: {{ hook }}; {{ '' }}

					< button.&__emit @click = tmp[stage]=true, emit(stage)
						{el[0]}

				- else
					< .&__result
						< template v-for = el in asyncRender.iterate(${el[1]})
							Element: {{ String(el) }}; Hook: {{ hook }}; {{ '' }}
