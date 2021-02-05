- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'super/i-block/modules/**/*.ss'|b
- import $C from 'collection.js'

/**
 * Base component template
 */
- template index()
	/** Hardcoded component name */
	- componentName = ''

	/** Type of the root tag */
	- rootTag = 'div'

	/** Should or not generate additional wrapper within the root tag */
	- rootWrapper = false

	/** Should or not generate a layout for overlap */
	- overWrapper = false

	/** Should or not the component have a skeleton */
	- skeletonMarker = false

	/**
	 * Returns the component name
	 * @param {string=} [name] - custom template name
	 */
	- block name(name)
		? name = name || componentName || TPL_NAME
		: nmsRgxp = /\['(.*?)'\]\.index/

		- if nmsRgxp.test(name)
			? name = nmsRgxp.exec(name)[1]

		- return name.split('.').slice(-1)[0].dasherize()

	/**
	 * Loads modules by the specified paths and dynamically inserted the provided content when it loaded
	 *
	 * @param {(string|!Array<string>)} path - path or an array of paths
	 * @param {{renderKey: string, wait: string}} [opts] - additional options
	 * @param {string=} [content]
	 *
	 * @example
	 * ```
	 * += self.loadModules('form/b-button')
	 *   < b-button
	 *     Hello world
	 *
	 * += self.loadModules(['form/b-button', 'form/b-input'], {renderKey: 'controls', wait: 'promisifyOnce.bind(null, "needLoad")'})
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

		? path = [].concat(path || [])

		- forEach path => id
			{{ void(moduleLoader.add({id: '${id}', load: () => import('${id}'), wait: ${opts.wait || 'undefined'}})) }}

		- if content != null
			- if opts.renderKey
				< template v-if = !field.get('ifOnceStore.${opts.renderKey}')
					{{ void(field.set('ifOnceStore.${opts.renderKey}', true)) }}

					< template v-for = _ in asyncRender.iterate(moduleLoader.values(...${path|json}), 1, { &
						useRaf: true,
						group: 'module:${opts.renderKey}'
					}) .
						+= content

			- else
				< template v-for = _ in asyncRender.iterate(moduleLoader.values(...${path|json}), 1, {useRaf: true})
					+= content

	/**
	 * Returns a link to a template by the specified path
	 * @param {string} path
	 */
	- block getTpl(path)
		? path = path.replace(/\/$/, '.index')
		- return $C(exports).get(path)

	/**
	 * Applies Typograf to the specified content
	 * @param {string} content
	 */
	- block index->typograf(content)
		+= content|typograf

	/**
	 * Appends the specified value to root component classes
	 * @param {string} value
	 */
	- block appendToRootClasses(value)
		- if rootAttrs[':class']
			? rootAttrs[':class'] = '[].concat((' + value + ') || [], ' + rootAttrs[':class'] + ')'

		- else
			rootAttrs[':class'] = value

	- rootAttrs = { &
		':class': '[...provide.componentClasses("' + self.name() + '", mods), "i-block-helper", componentId]',

		':-render-group': 'renderGroup',
		':-render-counter': 'renderCounter',

		'v-hook': "isFunctional || isFlyweight ?" +
			"{" +
				"bind: createInternalHookListener('bind')," +
				"inserted: createInternalHookListener('inserted')," +
				"update: createInternalHookListener('update')," +
				"unbind: createInternalHookListener('unbind')" +
			"} :" +

			"null"
	} .

	- if skeletonMarker
		? rootAttrs['data-skeleton-marker'] = 'true'

	- block rootAttrs

	- attrs = {}
	- block attrs

	- slotAttrs = {':stage': 'stage', ':ctx': 'self'}
	- block slotAttrs

	- block root
		< ?.${self.name()}
			< _ ${rootAttrs|!html}

				/**
				 * Generates an icon layout
				 *
				 * @param {(string|!Array<gIcon>)} iconId
				 * @param {Object=} [classes]
				 * @param {Object=} [attrs]
				 */
				- block index->gIcon(iconId, classes = {}, attrs = {})
					< svg[.g-icon] :class = provide.elClasses(${classes|json}) | ${attrs}
						- if Object.isArray(iconId)
							< use v-if = value | v-update-on = { &
								emitter: getIconLink(${iconId}),
								handler: updateIconHref,
								errorHandler: handleIconError
							} .

						- else
							< use v-if = value | v-update-on = { &
								emitter: getIconLink('${iconId}'),
								handler: updateIconHref,
								errorHandler: handleIconError
							} .

				/**
				 * Generates a slot declaration (scoped and plain)
				 *
				 * @param {string=} [name] - slot name
				 * @param {Object=} [attrs] - scoped slot attributes
				 * @param {string=} [content] - slot content
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

					< template v-if = $scopedSlots['${name}']
						< slot name = ${name} | ${Object.assign({}, slotAttrs, attrs)|!html}

					< template v-else
						< slot name = ${name}
							{content}

				- block headHelpers

				- block innerRoot
					< ${rootWrapper ? '_' : '?'}.&__root-wrapper
						< ${overWrapper ? '_' : '?'}.&__over-wrapper
							- block overWrapper

						- block body

					- block helpers
					- block providers
