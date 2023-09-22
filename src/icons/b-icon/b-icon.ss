- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'super/i-block'|b as placeholder

- template index() extends ['i-block'].index
	- rootTag = 'svg'

	- block body
		< use v-update-on = { &
			emitter: getIconLink(value),
			handler: (...args) => updateIconHref(value, ...args),
			errorHandler: (...args) => handleIconError(value, ...args)
		} .
