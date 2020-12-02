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
		 * @param {!Array<Option>} items - items to render
		 */
		- block list(value)
			< ${listElTag}.&__el.&__item v-for = item in ${value}
				< a &
					:class = provide.hintClasses(item.hintPos).concat(provide.elClasses({link: {
						id: Object.get(values, [item.value]),
						active: isActive(item),
						exterior: item.exterior,
						hidden: item.hidden,
						progress: item.progress,
						...item.classes
					}})) |

					:href = item.href |
					:-hint = item.hint |
					:-id = Object.get(values, [item.value]) |
					:v-attrs = item.attrs
				.
					- block preIcon
						< span.&__cell.&__link-icon.&__link-pre-icon v-if = vdom.getSlot('preIcon')
							+= self.slot('preIcon', {':item': 'item', ':icon': 'item.preIcon'})

						< span.&__cell.&__link-icon.&__link-pre-icon v-else-if = item.preIcon
							< component &
								v-if = item.preIconComponent |
								:instanceOf = bIcon |
								:is = item.preIconComponent |
								:value = item.preIcon
							.

							< @b-icon v-else | :value = item.preIcon

					- block value
						< span.&__cell.&__link-value
							+= self.slot('default', {':item': 'item'})
								{{ t(item.label) }}

					- block icon
						< span.&__cell.&__link-icon.&__link-post-icon v-if = vdom.getSlot('icon')
							+= self.slot('icon', {':item': 'item', ':icon': 'item.icon'})

						< span.&__cell.&__link-icon.&__link-post-icon v-else-if = item.icon
							< component &
								v-if = item.iconComponent |
								:instanceOf = bIcon |
								:is = item.iconComponent |
								:value = item.icon
							.

							< @b-icon v-else | :value = item.icon

					- block progress
						< span.&__cell.&__link-icon.&__link-progress v-if = item.progressIcon != null
							< template v-if = vdom.getSlot('progressIcon')
								+= self.slot('progressIcon', {':item': 'item', ':icon': 'item.progressIcon'})

							< component &
								v-else-if = Object.isString(el.progressIcon) |
								:is = el.progressIcon
							.

							< @b-progress-icon v-else

	- block body
		- super

		< ${listTag}.&__wrapper
			+= self.list('items')
