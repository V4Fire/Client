- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'super/i-input-text'|b as placeholder

- template index() extends ['i-input-text'].index
	- block body
		+= self.nativeInput()
