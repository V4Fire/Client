- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'super/i-block'|b as placeholder
- include 'traits/i-control-list'|b

- template index() extends ['i-block'].index
	- block body
		+= self.getTpl('i-control-list/')({ &
			from: 'controls',
			elClasses: 'control',
			wrapperClasses: 'control-wrapper'
		}) .
