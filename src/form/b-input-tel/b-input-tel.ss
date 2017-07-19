- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'form/b-input'|b as placeholder
- include 'presets'|b

- template index() extends ['b-input'].index
	- block preIcon
		- super
		< _.&__cell.&__langs
			+= @@p.bSelect('langs', { &
				props: {options: 'h.langCodes4select()'},
				events: {actionChange: 'onChangeLang'},
				mods: {theme: "'link'"}
			}) .
