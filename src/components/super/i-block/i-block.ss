- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'components/super/i-block/modules/**/*.ss'|b

/**
 * The base component template
 */
- template index()
	/** The hardcoded name of the component. If a name is not explicitly set, it will be based on the template file name. */
	- componentName = ''

	/** The root tag type. If not specified, it will be taken from the component `rootTag` prop. */
	- rootTag = null

	/** Should or not to create an extra wrapper inside the root tag */
	- rootWrapper = false

	/** Should or not create a layout for overlapping */
	- overWrapper = false

	/** Should or not the component have a skeleton marker attribute */
	- skeletonMarker = false

	/** A selector to mount component via teleport or false */
	- teleport = false

	/**
	 * If set to false, the component will generate a special markup to
	 * allow it to not render during server-side rendering
	 */
	- ssrRendering = true

	/**
	 * Defines the rendering mode of the template.
	 * For regular components, the default value of `'component'` can be used,
	 * whereas for templates that are rendered as a separate render function,
	 * rather than as a component, the value `'mono'` should be used.
	 */
	- renderMode = 'component'

	/**
	 * Returns the component name
	 * @param {string} [name] - the custom template name
	 */
	- block name(name)
		? name = name || componentName || TPL_NAME
		: nmsRgxp = /\['(.*?)'\]\.index/

		- if nmsRgxp.test(name)
			? name = nmsRgxp.exec(name)[1]

		- return name.split('.').slice(-1)[0].dasherize()

	/**
	 * Loads modules by the specified paths and dynamically inserted the provided content when them are loaded
	 *
	 * @param {(string|Array<string>)} path - the module path or list of paths
	 * @param {{renderKey: string, wait: string}} [opts] - additional options
	 * @param {string} [content]
	 *
	 * @example
	 * ```
	 * += self.loadModules('components/form/b-button')
	 *   < b-button
	 *     Hello world
	 *
	 * += self.loadModules(['components/form/b-button', 'components/form/b-input'], {renderKey: 'controls', wait: 'promisifyOnce.bind(null, "needLoad")'})
	 *   < b-button
	 *     Hello world
	 *
	 *   < b-input
	 * ```
	 */
	- block loadModules(path, opts = {}, content)
		: SSR = require('@config/config').webpack.ssr

		- if arguments.length < 3
			? content = opts
			? opts = {}

		: &
			buble = require('buble'),
			paths = Array.concat([], path),
			wait = opts.wait
		.

		- if SSR
			- if paths.length > 0 || wait
				? wait = '() => { const {Promise} = global; return new Promise(() => {}); }'

		- else if paths.length > 0 && wait
			? wait = '(() => { const promise = ' + wait + '.call(); return () => promise; })()'

		: &
			filter = (wait ? buble.transform("`" + wait + "`").code : 'undefined')
				.replace(/^\(?['"]/, '')
				.replace(/['"]\)?$/, '')
				.replace(/\\(['"])/g, '$1')
		.

		{{
			void(require('components/friends/module-loader').default.addToPrototype(require('components/friends/module-loader')))
		}}

		{{
			void(require('components/friends/async-render').default.addToPrototype(require('components/friends/async-render').iterate))
		}}

		- forEach paths => path
			: &
				id = [path, wait || 'undefined'].concat(wait ? '${componentId}' : []).join(':'),
				interpolatedId = buble.transform("`" + id + "`").code
			.

			{{
				void(moduleLoader.addToBucket('global', {
					id: ${interpolatedId},
					load: () => import('${path}'),
					ssr: false
				}))
			}}

		- if content != null
			- if opts.renderKey
				: renderKey = buble.transform("`" + opts.renderKey + "`").code

				< template v-if = !field.get('ifOnceStore.' + ${renderKey})
					{{ void(field.set('ifOnceStore.' + ${renderKey}, true)) }}

					< template v-for = _ in asyncRender.iterate(moduleLoader.loadBucket('global'), 1, { &
						useRaf: true,
						group: 'module:' + ${renderKey},
						filter: ${filter}
					}) .
						+= content

			- else
				< template v-for = _ in asyncRender.iterate(moduleLoader.loadBucket('global'), 1, {useRaf: true, filter: ${filter}})
					+= content

	/**
	 * Renders the specified content by using the passed options
	 *
	 * @param {{renderKey: string, wait: string}} opts - the options to render
	 * @param {string} content
	 *
	 * @example
	 * ```
	 * += self.render({renderKey: 'controls', wait: 'promisifyOnce.bind(null, "needLoad")'})
	 *   < b-button
	 *     Hello world
	 *
	 *   < b-input
	 * ```
	 */
	- block render(opts, content)
		+= self.loadModules([], opts)
			+= content

	/**
	 * Returns a link to a template by the specified path
	 * @param {string} path
	 */
	- block getTpl(path)
		? path = path.replace(/\/$/, '.index')
		- return Object.get(exports, path)

	/**
	 * Applies the `Typograf` library for the specified content and returns the result
	 * @param {string} content
	 */
	- block typograf(content)
		+= content|typograf

	/**
	 * Appends the specified value to the root component classes
	 * @param {string} value
	 */
	- block appendToRootClasses(value)
		- if rootAttrs[':class']
			? rootAttrs[':class'] = '[].concat((' + value + ') || [], ' + rootAttrs[':class'] + ')'

		- else
			? rootAttrs[':class'] = value


	- rootClass = {'data-cached-dynamic-class': '["call", "provide.componentClasses", "' + self.name() + '", ["get", "mods"]]'}

	- if renderMode == 'mono'
		? rootClass = {':class': '[...provide.componentClasses("' + self.name() + '", mods)]'}

	- rootAttrs = { &
		class: 'i-block-helper',
		'v-async-target': '!ssrRendering',
		...rootClass
	} .

	- if teleport
		? rootAttrs[':ref'] = '$resolveRef("$el")'
		? rootAttrs['v-ref'] = '"$el"'

	: componentId = 'data-cached-class-component-id'

	- if require('@config/config').webpack.ssr
		? rootAttrs[':' + componentId] = 'String(renderComponentId)'

	- else
		? rootAttrs[componentId] = 'true'

	- if skeletonMarker
		? rootAttrs['data-skeleton-marker'] = 'true'

	- block rootAttrs

	- attrs = {}
	- block attrs

	- slotAttrs = {':stage': 'stage', ':ctx': 'self'}
	- block slotAttrs

	- block root
		< ${teleport ? 'template' : '?'} v-if = r.shouldMountTeleports
			< ${teleport ? 'span' : '?'}.i-block-helper.${self.name()} -teleport
				< ${teleport ? 'teleport' : '?'} to = ${teleport}
					< _ v-attrs = rootAttrs | ${rootAttrs|!html}
						{{ void(vdom.saveRenderContext()) }}
						{{ void(r.initGlobalEnv()) }}

						/**
						 * Generates a slot declaration by the specified parameters
						 *
						 * @param {string} [name] - the slot name
						 * @param {object} [attrs] - the scoped slot attributes
						 * @param {string} [content] - the slot content
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

							< slot name = ${name} | ${Object.assign({}, slotAttrs, attrs)|!html}
								+= content

						- block renderRootContent()
							- block headHelpers

							- block innerRoot
								- block helpers
								- block providers

								- block bodyHeader

								< ${rootWrapper ? '_' : '?'}.&__root-wrapper
									< ${overWrapper ? '_' : '?'}.&__over-wrapper
										- block overWrapper

									- block body

								- block bodyFooter

						- if !ssrRendering
							< template v-if = !ssrRendering
								+= self.render({wait: 'async.idle.bind(async)'})
									+= self.renderRootContent()

							< template v-else
								+= self.renderRootContent()

						- else
							+= self.renderRootContent()

- template mono() extends ['i-block'].index
	- renderMode = 'mono'
