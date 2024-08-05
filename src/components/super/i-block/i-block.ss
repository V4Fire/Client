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

	/** The root tag type. This value will be used if a similarly named runtime prop is not passed to the component. */
	- rootTag = 'div'

	/** Should or not to create an extra wrapper inside the root tag */
	- rootWrapper = false

	/** Should or not create a layout for overlapping */
	- overWrapper = false

	/** Should or not the component have a skeleton marker attribute */
	- skeletonMarker = false

	/** A selector to mount component via teleport or false */
	- teleport = false

	/**
	* If set to true, the component will always be rendered by creating an intermediate VNODE tree.
	* Enabling this option may negatively affect rendering speed in SSR.
	* However, this mode is necessary for using some directives.
	*/
	- forceRenderAsVNode = false

	/** True if the application is built for SSR */
	- SSR = require('@config/config').webpack.ssr

	/** True if the application is built for hydration */
	: HYDRATION = require('@config/config').webpack.hydration()

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
	 * Loads modules by the specified paths and dynamically inserted the provided content when they are loaded
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
	 * += self.loadModules(['components/form/b-button', 'components/form/b-input'], { &
	 *   renderKey: 'controls',
	 *   wait: 'moduleLoader.waitSignal("controls")'
	 * }) .
	 *   < b-button
	 *     Hello world
	 *
	 *   < b-input
	 * ```
	 */
	- block loadModules(path, opts = {}, content)
		- if arguments.length < 3
			? content = opts
			? opts = {}

		: &
			buble = require('buble'),
			paths = Array.concat([], path),
			wait = opts.wait
		.

		/// Dynamically loaded modules imply asynchronous behavior, meaning they
		/// should not be rendered server-side (SSR) a priori.
		/// Therefore, we create a special promise that will only resolve after the rendering has completed.
		/// This will enable us to exclude such fragments from the SSR rendering.
		- if SSR
			- if paths.length > 0
				? wait = '() => waitComponentStatus("destroyed")'

			- else if wait
				/// If the wait function is explicitly set to null,
				/// it means that rendering on the server needs to be forced
				? wait = '((f) => f == null ? f : () => waitComponentStatus("destroyed"))(' + wait + ')'

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

		: ids = []

		- forEach paths => path
			? ids.push([path, wait || 'undefined'].concat(wait ? '${componentId}' : []).join(':'))

		: bucket = Object.fastHash(ids.join(';')) |json

		- forEach paths => path, i
			: &
				id = ids[i],
				interpolatedId = buble.transform("`" + id + "`").code
			.

			{{
				void(${SSR} ? null : moduleLoader.addToBucket(${bucket}, {
					id: ${interpolatedId},
					load: () => (async () => {
						if (typeof (${filter}) === 'function') {
							return (${filter})();
						}
					})().then(() => import('${path}'))
				}))
			}}

		- if !SSR && paths.length > 0
			? filter = 'undefined'

		- if content != null
			- if opts.renderKey
				: renderKey = buble.transform("`" + opts.renderKey + "`").code

				< template v-if = !field.get('ifOnceStore.' + ${renderKey})
					{{ void(field.set('ifOnceStore.' + ${renderKey}, true)) }}

					< template v-for = _ in asyncRender.iterate(${SSR} ? 1 : moduleLoader.loadBucket(${bucket}), 1, { &
						useRaf: true,
						group: 'module:' + ${renderKey},
						filter: ${filter}
					}) .
						+= content

			- else
				< template v-for = _ in asyncRender.iterate(${SSR} ? 1 : moduleLoader.loadBucket(${bucket}), 1, { &
					useRaf: true,
					filter: ${filter}
				}) .
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

	- if SSR
		? rootAttrs[':' + componentId] = 'String(!canFunctional)'

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
						{{ void(hydrateStyles('${self.name()}')) }}

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

						- block rootContent
							- block skeleton

							- if SSR || HYDRATION
								< template v-if = ssrRendering
									+= self.renderRootContent()

							- else
								+= self.renderRootContent()

- template mono() extends ['i-block'].index
	- renderMode = 'mono'
