- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * Base block template
 */
- template index()
	- blockName = ''

	/**
	 * Returns the block name
	 */
	- block name()
		- return blockName || /\['(.*?)'\]/.exec(TPL_NAME)[1]

	- rootTag = 'div'
	- overWrapper = true

	- rootAttrs = {':class': 'blockId'}
	- block rootAttrs

	- attrs = {}
	- block attrs

	- slotAttrs = {':stage': 'stage', ':ctx': 'self'}
	- block slotAttrs

	- block root
		< _.${self.name()} ${rootAttrs|!html}

			/**
			 * Generates double slot declaration (scoped and plain)
			 *
			 * @param {string=} [name] - slot name
			 * @param {Object=} [attrs] - scoped slot attributes
			 * @param {string=} [content] - slot content
			 */
			- block slot(name = 'default', attrs, content)
				- switch arguments.length
					> 1
						- if name instanceof Unsafe
							? content = name
							? name = 'default'

					> 2
						- if attrs instanceof Unsafe
							? content = attrs
							? attrs = {}

				< template v-if = $scopedSlots['${name}']
					< slot name = ${name} | ${Object.assign({}, slotAttrs, attrs)|!html}

				< template v-else
					< slot name = ${name}
						{content}

			- block headHelpers
			- block innerRoot
				< _.&__root-wrapper
					- if overWrapper
						< _.&__over-wrapper
							- block overWrapper

					- block body
				- block helpers
