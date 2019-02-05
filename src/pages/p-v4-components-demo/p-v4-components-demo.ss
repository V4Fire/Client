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
		< b-v4-component-demo #default = {ctx}
			< b-button v-func = false | @statusReady = ctx.debug
				Some text

		< b-v4-component-demo #default = {ctx}
			< b-checkbox v-func = false | @statusReady = ctx.debug
				Some text

		/*< b-v4-component-demo #default = {ctx}
			< b-select @statusReady = ctx.debug | :options = [ &
				{
					value: '0',
					label: '0'
				},

				{
					value: '1',
					label: '1'
				},

				{
					value: '2',
					label: '2'
				},

				{
					value: '3',
					label: '3'
				},

				{
					value: '4',
					label: '4'
				},

				{
					value: '5',
					label: '5'
				}
			] .*/
