- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'super/i-data'|b as placeholder

- template index() extends ['i-data'].index
	- listTag = 'ul'
	- listElTag = 'li'

	- block headHelpers
		- super

		/**
		 * Generates a list block
		 * @param {!Array<Option>} value - array of values
		 */
		- block list(value)
			< ${listElTag}.&__el v-for = el in ${value}
				< a &
					:class = provide.hintClasses(el.hintPos).concat(provide.elClasses({link: {
						id: values[el.value],
						active: isActive(el),
						exterior: el.exterior,
						hidden: el.hidden,
						progress: el.progress,
						...el.classes
					}})) |

					:href = el.href |
					:-hint = el.hint |
					:-id = values[el.value] |
					:v-attrs = el.attrs
				.
					- block preIcon
						< span.&__cell.&__link-icon.&__link-pre-icon v-if = vdom.getSlot('preIcon')
							+= self.slot('preIcon', {':icon': 'preIcon'})

						< span.&__cell.&__link-icon.&__link-pre-icon v-else-if = el.preIcon
							< component &
								v-if = el.preIconComponent || el.preIconHint |
								:instanceOf = bIcon |
								:is = el.preIconComponent || 'b-icon' |
								:value = el.preIcon |
								:hint = el.preIconHint
							.

							< @b-icon v-else | :value = el.preIcon

					- block text
						< span.&__cell.&__link-text v-if = !hideLabels
							{{ t(el.label) }}

					- block info
						< span.&__cell.&__link-info v-if = vdom.getSlot('info')
							+= self.slot('info', {':option': 'el'})

					- block icon
						< span.&__cell.&__link-icon.&__link-post-icon v-if = vdom.getSlot('icon')
							+= self.slot('icon', { &
								':icon': 'el.icon',
								':hint': 'getElHint(el)',
								':hintPos': 'el.iconHintPos'
							}) .

						< span.&__cell.&__link-icon.&__link-post-icon v-else-if = el.icon
							< component &
								v-if = el.iconComponent |
								:instanceOf = bIcon |
								:is = el.iconComponent || 'b-icon' |
								:value = el.icon |
								:hint = getElHint(el) |
								:hintPos = el.iconHintPos
							.

							< @b-icon &
								v-else |
								:value = el.icon |
								:hint = getElHint(el) |
								:hintPos = el.iconHintPos
							.

					- block progress
						< span.&__cell.&__link-icon.&__link-progress v-if = el.progressIcon != null
							< template v-if = vdom.getSlot('progressIcon')
								+= self.slot('progressIcon', {':icon': 'el.progressIcon'})

							< component &
								v-else-if = progressIcon |
								:is = progressIcon
							.

							< @b-progress-icon v-else

	- block body
		- super

		< ${listTag}.&__wrapper
			+= self.list('value')
