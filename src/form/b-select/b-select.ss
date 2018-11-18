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
			+= self.gIcon('expand_more')

	- block input
		- super
		< select.&__native &
			ref = select |
			v-if = b.is.mobile |
			v-model = selectedStore |
			@focus = onFocus |
			@blur = onBlur |
			@change = onOptionSelected($event.target.dataset.value)
		.
			< option v-for = el in options | :key = :value, el.value
				{{ el.label }}

	- block helpers
		- super
		- block dropdown
			< _.&__dropdown[.&_pos_bottom-left] &
				v-if = !b.is.mobile && options.length && (isFunctional || ifOnce('opened', m.opened !== 'false'))
			.
				< _.&__dropdown-content
					< _.&__dropdown-content-wrapper
						< b-scroll-inline.&__scroll &
							v-func = isFunctional |
							ref = scroll |
							:fixSize = true |
							:mods = provideMods({size: 'm'})
						.
							< _ &
								v-for = el in options |
								:key = :-value, el.value |
								:class = getElClasses({
									option: {
										marked: el.marked,
										selected: isSelected(el)
									}
								})
							.

								< template v-if = $scopedSlots.default
									< slot :el = el | ${slotAttrs|!html}

								< template v-else-if = option
									< component :is = option | :p = el

								< template v-else
									{{ t(el.label) }}
