- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'super/i-static-page/i-static-page.component.ss'|b as placeholder

- template index() extends ['i-static-page.component'].index
	- block body
		: config = require('@config/config').build

		< b-tree &
      	/// The specified items are rendered as `b-checkbox`-es
      	:item = 'b-button' |

      	:items = [
      		{id: 'bar', label: 'bar'},
      		{id: 'foo', label: 'foo', children: [
      			{id: 'fooone', label: 'foo1',},
      			{id: 'footwo', label: 'foo2',},

      			{
      				id: 'foothree',
      				label: 'foo3',
      				children: [
      					{id: 'foothreeone', label: 'foo4'},
      					{id: 'foothreeone2', label: 'foo44', children: [
      						{id: 'foothreeone25', label: 'foo44', children: [{id: 'foothreeone', label: 'foo4'}]}
      					]}
      				]
      			},

      			{
                				id: 'foothree4',
                				label: 'foo3',
                				children: [
                					{id: 'foothreeone4', label: 'foo4'}
                				]
                			},

      			{id: 'foosix', label: 'foo5',}
      		]},

      		{id: 'foo5', label: 'foo', children: [
              			{id: 'fooone5', label: 'foo1',},
              			{id: 'footwo5', label: 'foo2',},

              			{
              				id: 'foothree5',
              				label: 'foo3',
              				children: [
              					{id: 'foothreeone', label: 'foo4'}
              				]
              			},

              			{id: 'foosix5', label: 'foo5',}
              		]}
      	]
      .


		- forEach config.components => @component
			- if config.inspectComponents
				< b-v4-component-demo
					< ${@name} &
						v-func = false |
						slot-scope = {ctx} |
						@statusReady = ctx.debug |
						${@attrs}
					.
						- if Object.isString(@content)
							+= @content

						- else
							- forEach @content => el, key
								< template #${key} = {ctx}
									+= el

			- else
				< ${@name} ${@attrs}
					- if Object.isString(@content)
						+= @content

					- else
						- forEach @content => el, key
							< template #${key} = {ctx}
								+= el
