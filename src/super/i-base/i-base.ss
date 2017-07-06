- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * Base template
 */
- placeholder index()
	- blockName = ''

	/**
	 * Returns the block name
	 */
	- block name()
		- return blockName || /\['(.*?)'\]/.exec(TPL_NAME)[1]
