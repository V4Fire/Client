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
	/** Helpers to generate a template */
	- h = include('src/super/i-static-page/modules/ss-helpers')

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
	- assetsRequest = false

	/** Map of external libraries to load */
	- deps = include('src/super/i-static-page/deps')

	/** Own dependencies of the page */
	- ownDeps = @@entryPoints[self.name()] || {}

	/** Map with static page assets */
	- assets = await h.getAssets(@@entryPoints)

	- block root
		: runtime = require('config').runtime()

		- if runtime.includeThemes && runtime.theme
			? Object.assign(htmlAttrs, {class: 'root_theme_' + runtime.theme})

		- block pageData
			? rootAttrs['data-root-component'] = self.name()
			? rootAttrs['data-root-component-params'] = ({data: pageData}|json)

		? await h.generatePageInitJS(self.name(), { &
			deps,
			ownDeps,

			assets,
			assetsRequest,

			rootTag,
			rootAttrs
		}) .

		- block doctype
			- doctype

		- block htmlAttrs

		< html ${htmlAttrs}
			< head
				- block head
					: base = @@publicPath()

					- if defineBase
						- block base
							< base href = ${base}

					- block meta

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

					- block favicons
						+= h.getFaviconsDecl()

					- block title
						< title
							{title}

					- block links
						+= await h.loadLinks(deps.links, {assets})

					- block headScripts
						+= h.getVarsDecl({wrap: true})
						+= await h.loadLibs(deps.headScripts, {assets})

			< body
				< ${rootTag}.i-static-page.${self.name()} ${rootAttrs|!html}
					- block headHelpers

					- block innerRoot
						- if overWrapper
							< .&__over-wrapper
								- block overWrapper

							- block body

						- block helpers
						- block providers

				- block deps
					- block assets
						+= h.getAssetsDecl({inline: !assetsRequest, wrap: true})

					- block styles
						+= await h.loadStyles(deps.styles, {assets})
						+= h.getPageStyleDepsDecl(ownDeps, {assets, wrap: true})

					- block scripts
						+= h.getScriptDeclByName('std', {assets, optional: true, wrap: true})

						+= await h.loadLibs(deps.scripts, {assets})
						+= h.getInitLibDecl({wrap: true})

						+= h.getScriptDeclByName('vendor', {assets, optional: true, wrap: true})
						+= h.getPageScriptDepsDecl(ownDeps, {assets, wrap: true})
						+= h.getScriptDeclByName('webpack.runtime', {assets, wrap: true})
