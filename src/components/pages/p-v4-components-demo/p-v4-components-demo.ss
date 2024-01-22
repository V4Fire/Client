- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'components/super/i-static-page/i-static-page.component.ss'|b as placeholder

- template index() extends ['i-static-page.component'].index
	- block body
		< b-dummy ref = dummy
			< b-select &
				ref = select |
				v-func = false |
				:value = '1' |
				:items = [
					{value: '1', label: '001'},
					{value: '2', label: '002'}
				] |
				:native = true |
				:form = false
			.

		< . v-async-target
			+= self.loadModules('components/dummies/b-dummy')
				< b-dummy ref = dummyAsync
					< b-select &
						ref = selectAsync |
						v-func = false |
						:value = '3' |
						:items = [
							{value: '3', label: '003'},
							{value: '4', label: '004'}
						] |
						:native = true |
						:form = false
					.
