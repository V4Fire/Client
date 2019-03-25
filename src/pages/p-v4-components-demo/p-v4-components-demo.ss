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
		< b-v4-component-demo
			< b-file-button &
				v-func = false |
				slot-scope = {ctx} |
				@statusReady = ctx.debug
			.
				Some text

		< b-v4-component-demo
			< b-button &
				v-func = false |
				slot-scope = {ctx} |
				@statusReady = ctx.debug
			.
				Some text

		< b-v4-component-demo
			< b-checkbox &
				v-func = false |
				slot-scope = {ctx} |
				@statusReady = ctx.debug
			.
				Some text

		< b-v4-component-demo
			< b-calendar &
				slot-scope = {ctx} |
				:value = new Date() |
				@statusReady = ctx.debug
			.
				Some text

		< b-v4-component-demo
			< b-calendar &
				slot-scope = {ctx} |
				:value = [new Date().beginningOfMonth(), new Date()] |
				@statusReady = ctx.debug
			.
				Some text

		< b-v4-component-demo
			< b-input &
				v-func = false |
				slot-scope = {ctx} |
				@statusReady = ctx.debug
			.
				Some text

		< b-v4-component-demo
			< b-select v-func = false | slot-scope = {ctx} | @statusReady = ctx.debug | :options = [ &
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
				},

				{
					value: '6',
					label: '6'
				},

				{
					value: '7',
					label: '7'
				},

				{
					value: '8',
					label: '8'
				},

				{
					value: '9',
					label: '9'
				},

				{
					value: '10',
					label: '10'
				},

				{
					value: '11',
					label: '11'
				}
			] .
