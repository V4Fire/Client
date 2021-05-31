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
		: config = require('config').build

		< b-button ref = a | v-func = false
			Test

		< button @click = $refs.a.deactivate()
			Deactivate

		< button @click = $refs.a.activate()
			Activate

		< button @click = $refs.a.watchTmp.a=($refs.a.watchTmp.a || 0) + 1
			Mutate

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
