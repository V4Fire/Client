- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'super/i-block/modules/**/*.ss'|b
- import $C from 'collection.js'

/**
 * Base block template
 */
- template index()
	- blockName = ''

	/**
	 * Returns the block name
	 * @param {string=} [name] - custom template name
	 */
	- block name(name = TPL_NAME)
		- return (blockName || /\['(.*?)'\]/.exec(name)[1] || '').dasherize()

	/**
	 * Returns link to a template by the specified link
	 */
	- block getTpl(nms)
		? nms = nms.replace(/\/$/, '.index')
		- return $C(exports).get(nms)

	- rootTag = 'div'
	- overWrapper = true
	- renderCounter = true

	/**
	 * Applies Typograf to the specified content
	 * @param {string} content
	 */
	- block index->typograf(content)
		+= content|typograf

	/**
	 * Appends the specified value to root component classes
	 * @param {string} value
	 */
	- block appendToRootClasses(value)
		- if rootAttrs[':class']
			? rootAttrs[':class'] += '.concat(' + value + ')'

		- else
			rootAttrs[':class'] = value

	- rootAttrs = {':class': '[componentId, getBlockClasses(mods), "i-block-helper"]'}
	- block rootAttrs

	- attrs = {}
	- block attrs

	- slotAttrs = {':stage': 'stage', ':ctx': 'self'}
	- block slotAttrs

	- block root
		< _.${self.name()} ${rootAttrs|!html}
			- if renderCounter
				< .&__render-counter v-show = false
					{{ renderCounter }}

			/**
			 * Generates an icon block
			 *
			 * @param {(string|!Array<gIcon>)} iconId
			 * @param {Object=} [classes]
			 * @param {Object=} [attrs]
			 */
			- block index->gIcon(iconId, classes = {}, attrs = {})
				< svg[.g-icon] :class = getElClasses(${classes|json}) | ${attrs}
					- if Object.isArray(iconId)
						< use :xlink:href = getIconLink(${iconId})

					- else
						< use :xlink:href = getIconLink('${iconId}')

			/**
			 * Generates a transition wrapper for a content
			 * @param {string=} [content] - content to wrapping
			 */
			- block transition(content)
				: elName = (content + '' |getFirstTagElementName)

				- if !elName
					< transition
						{content}

				- else
					: a = {}

					- forEach ['enter', 'enter-active', 'enter-to', 'leave', 'leave-active', 'leave-to'] => type
						? a[type + '-class'] = elName + '_' + type + '_true';

					< transition ${a}
						{content}

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
				- block providers
