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

		< b-checkbox-group &
			:tree = true |
			:options = [
				{id: '112', label: 'Первый уровень 112', name: 'Радиокнопка 1', level: 1},
				{id: '232', label: 'Второй уровень 232', name: 'Радиокнопка 123', level: 2, parent: '112'},
				{id: '78', label: 'Второй уровень имя 2 - 78', name: 'Радиокнопка 1234',  level: 2, parent: '112'},
				{id: '3421', label: 'Третий уровень - 3421', name: 'Радиокнопка 1235',  level: 3, parent: '232'},
				{id: '3423', label: 'Четвёрый уровень - 3423', name: 'Радиокнопка 12356',  level: 4, parent: '3421'}
			]
		.

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
