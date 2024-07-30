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
		{{ someField }}

		< hr

		< b-form v-func = false | :action = onSubmit | ref = form
			< b-checkbox &
				:name = 'agree' |
				:required = true |
				:validators = ['required'] |
				:checked = getCheckedValue() |
				@onChange = onCheckedChange |
				v-func = false
			.
				< template #label
					I agree

			< hr

			< button type = submit
				Submit

		< template v-if = stage === 'teleports'
			< b-bottom-slide
