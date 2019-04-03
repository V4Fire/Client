- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'super/i-input'|b as placeholder

- template index() extends ['i-input'].index
	- rootTag = 'span'

	- block attrs
		- super
		? attrs['@click'] = 'onClick'

	- block body
		- super

		- block input
			+= self.hiddenInput()

		- block wrapper
			< _.&__wrapper @click = onClick
				- block checkbox
					< _.&__box

					- block label
						< span.&__label v-if = label
							{{ t(label) }}
