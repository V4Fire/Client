- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'super/i-message'|b as placeholder

- template index() extends ['i-message'].index
	- block slotAttrs
		- super
		? Object.assign(slotAttrs, {':db': 'db'})
