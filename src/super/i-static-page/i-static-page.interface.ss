- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'super/i-page'|b
- import fs from 'fs-extra-promise'

/**
 * Injects the specified file to a template
 * @param {string} src
 */
- block index->inject(src)
	- return fs.readFileSync(src).toString()

/**
 * Base page template
 */
- async template index(@params = {}) extends ['i-page'].index
	/** Static page title */
	- title = @@appName

	/** Additional static page data */
	- pageData = {}

	/** Page charset */
	- charset = 'utf-8'

	/** Map of meta viewport attributes */
	- viewport = { &
		'width': 'device-width',
		'initial-scale': '1.0',
		'maximum-scale': '1.0',
		'user-scalable': 'no'
	} .

	/** Map with attributes of <html> tag */
	- htmlAttrs = {}

	/** @override */
	- rootAttrs = {}

	/** Should or not generate <base> tag */
	- defineBase = false

	/** Should or not do a request for assets.js */
	- assetsRequest = true

	/** Map of external libraries to load */
	- deps = include('src/super/i-static-page/deps')

	/** Dependencies of the active entry point */
	- entryPoint = @@entryPoints[self.name()] || {}

	/** Map with static page assets */
	- assets = {}

	/** Helpers to generate a template */
	- h = include('src/super/i-static-page/modules/ss-helpers')

	- block root
		? await h.initAssets(assets, @@entryPoints)
		? await h.generateInitJS(self.name(), {deps, entryPoint, assets})

		- block doctype
			- doctype

		- block htmlAttrs

		< html ${htmlAttrs}
			< head
				: base = @@publicPath()

				- block charset
					< meta charset = ${charset}

				- block viewport
					: content = []

					- forEach viewport => el, key
						? content.push(key + '=' + el)

					< meta &
						name = viewport |
						content = ${content}
					.

				- if defineBase
					- block base
						< base href = ${base}

				- block favicons
					+= h.getFaviconsDecl()

				- block title
					< title
						{title}

				- block links
					+= await h.loadLinks(deps.links, assets)

				- block headScripts
					+= await h.loadLibs(deps.headScripts, assets)

			: pageName = self.name()

			- block pageData
				? rootAttrs['data-root-component'] = pageName
				? rootAttrs['data-root-component-params'] = ({data: pageData}|json)

			< body
				< ${rootTag}.i-static-page.${pageName} ${rootAttrs|!html}
					- block headHelpers

					- block innerRoot
						- if overWrapper
							< .&__over-wrapper
								- block overWrapper

							- block body

						- block helpers
						- block providers

				- block head
					- block styles
						+= await h.loadStyles(deps.styles, {assets})
						+= h.loadEntryPointDependencies(entryPoint, {type: 'styles', wrap: true})

					+= h.getVarsDecl({assets, wrap: true})

					- block assets
						- if !@@fatHTML && assetsRequest
							+= h.getScriptDecl({src: @@publicPath(@@assetsJS)})

					- block scripts
						+= h.getScriptDeclByName('std', {optional: true, wrap: true})

						+= await h.loadLibs(deps.scripts, {assets})
						+= h.getInitLibDecl({wrap: true})

						+= h.getScriptDeclByName('vendor', {optional: true, wrap: true})
						+= h.loadEntryPointDependencies(entryPoint, {type: 'scripts', wrap: true})
						+= h.getScriptDeclByName('webpack.runtime', {wrap: true})
