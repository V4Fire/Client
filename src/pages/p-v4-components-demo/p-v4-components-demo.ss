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

		< b-dummy :pageProp = someField

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
