- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'base/b-window'|b as placeholder

- template index() extends ['b-window'].index
	- block slotAttrs
		- super
		? Object.assign(slotAttrs, {':id': 'id'})

	- block controls
		< b-button &
			:type = 'submit' |
			:form = getConnectedId('form') |
			:preIcon = 'save' |
			:mods = provideMods({theme: 'light', rounding: 'small', size: gt[m.size]})
		.
			{{ stage === 'new' ? `Add` : `Save` }}

		- super

	- block content
		< b-form &
			ref = form |
			:id = getConnectedId('form') |
			:dataProvider = dataProvider |
			:method = methodName |
			@submitSuccess = close |
			${attrs|!html}
		.
			+= self.slot('form')
				- block form
