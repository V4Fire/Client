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
		: defAttrs = { &
			':info': "'Some info text'",
			':error': "'Some info text'",
			':mods': '{showInfo: false, showError: false}'
		} .

		< b-v4-component-demo
			< b-file-button &
				v-func = false |
				slot-scope = {ctx} |
				@statusReady = ctx.debug |
				${defAttrs}
			.
				Some text

		< b-v4-component-demo
			< b-button &
				v-func = false |
				slot-scope = {ctx} |
				@statusReady = ctx.debug |
				${defAttrs}
			.
				Some text

		< b-v4-component-demo
			< b-checkbox &
				v-func = false |
				slot-scope = {ctx} |
				@statusReady = ctx.debug |
				${defAttrs}
			.
				Some text

		< b-v4-component-demo
			< b-calendar &
				slot-scope = {ctx} |
				:value = new Date() |
				@statusReady = ctx.debug |
				${defAttrs}
			.
				Some text

		< b-v4-component-demo
			< b-calendar &
				slot-scope = {ctx} |
				:value = [new Date().beginningOfMonth(), new Date()] |
				@statusReady = ctx.debug |
				${defAttrs}
			.
				Some text

		< b-v4-component-demo
			< b-input &
				v-func = false |
				slot-scope = {ctx} |
				@statusReady = ctx.debug |
				${defAttrs}
			.
				Some text

		< b-v4-component-demo
			< b-select &
				v-func = false |
				slot-scope = {ctx} |
				:options = selectOptions |
				@statusReady = ctx.debug |
				${defAttrs}
			.
