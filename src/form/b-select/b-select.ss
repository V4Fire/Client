- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'form/b-input'|b as placeholder

- template index() extends ['b-input'].index
	- block icons
		< _.&__cell.&__icon.&__expand @click = open
			< @b-icon :value = 'expand_more'

	- block input
		- super
		< select.&__native &
			ref = select |
			v-if = browser.is.mobile |
			v-model = selectedStore |
			@focus = onFocus |
			@blur = onBlur |
			@change = onOptionSelected($event.target.value)
		.
			< option v-for = el in options | :key = :value, el.value
				{{ el.label }}

	- block helpers
		- super
		- block dropdown
			< _.&__dropdown[.&_pos_bottom-left] &
				v-if = !browser.is.mobile && options.length && (
					isFunctional ||
					opt.ifOnce('opened', m.opened !== 'false') && delete watchModsStore.opened
				)
			.
				< _.&__dropdown-content
					< _.&__dropdown-content-wrapper
						< b-scroll-inline.&__scroll &
							ref = scroll |
							v-func = isFunctional |
							:fixSize = true |
							:exterior = scrollExterior
						.
							< _ &
								v-for = el in options |
								:key = :-value, el.value |
								:class = provide.elClasses({
									option: {
										marked: el.marked,
										selected: isSelected(el)
									}
								})
							.

								< template v-if = vdom.getSlot('default')
									+= self.slot('default', {':option': 'el'})

								< component &
									v-else-if = option |
									:is = option |
									:p = el |
									:exterior = el.exterior |
									:classes = el.classes |
									:mods = el.mods |
									:v-attrs = el.attrs
								.

								< template v-else
									{{ t(el.label) }}
