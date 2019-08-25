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
			':error': "'Some error text'",
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

		< b-v4-component-demo
			< b-image &
				:src = 'https://avatars.mds.yandex.net/get-pdb/1789050/30714d83-1b23-4a48-990a-cadb3ea19a71/s1200' |
				:ratio = 16/9 |
				:sizeType = 'cover' |
				:style = {width: '200px'} |
				slot-scope = {ctx} |
				@statusReady = ctx.debug |
				${defAttrs}
			.

