- namespace presets

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include './*'
- include 'presets/**/*.ss'|b

/**
 * Mixes the specified parameters and returns a new object
 *
 * @param {Object=} a
 * @param {Object=} b
 * @returns {!Object}
 */
- block index->mixin(a = {}, b = {})
	: p = Object.assign({ &
		classes: {},
		props: {},
		events: {},
		mods: {},
		attrs: {}
	}, a) .

	- forEach b => el, key
		: val = p[key]

		- if Object.isObject(val) && Object.isObject(el)
			? Object.assign(val, el)

		- else if Array.isArray(val) && Array.isArray(el)
			? p[key] = Array.union(val, el)

		- else
			? p[key] = el

	- return p

/**
 * Creates a component by the specified parameters
 *
 * @param {string} component
 * @param {Object=} [params] - additional parameters ({ref, if, elseIf, else, show, props, events, mods, attrs})
 * @param {string=} [content] - slot content
 */
- block index->createComponent(component, params = {}, content)
	: p = Object.assign({ &
		classes: {},
		props: {},
		events: {},
		mods: {},
		attrs: {}
	}, params) .

	- forEach p => el, cluster
		- if Object.isObject(el)
			- forEach el => val, key
				- switch cluster
					> 'props'
						? delete el[key]
						? el[key.slice(0, 2) !== 'v-' ? ':' + key : key] = val

					> 'events'
						? delete el[key]
						? el['@' + key] = val

	- if p.mods
		? p.props[':mods'] = 'provide.mods(' + (p.mods|json|replace /:\s*"(.*?)"/g, ':$1') + ')'

	- if p.classes
		? p.props[':class'] = p.classes

	- if p.ref
		? p.attrs.ref = p.ref

	- forEach ['if', 'elseIf', 'else', 'show', 'model'] => el
		- if p[el]
			? p.attrs['v-' + String.dasherize(el)] = p[el]

	< ${component} ${p.props|!html} | ${p.events|!html} | ${p.attrs|!html}
		{content}

- template index()
	- rootTag = 'div'

- head
	? @index()
	- @@p = {}
	- forEach @index.Blocks => el, key
		? @@p[key] = el
