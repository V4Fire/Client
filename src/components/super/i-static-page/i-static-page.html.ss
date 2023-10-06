- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'components/super/i-page'|b

- import config from '@config/config'
- import fs from 'fs-extra'

/**
 * Injects the specified file to a template
 * @param {string} src
 */
- block index->inject(src)
	- return fs.readFileSync(src).toString()

- async template index(@params = {}) extends ['i-page'].index
	/** Helpers to generate a template */
	- h = include('src/components/super/i-static-page/modules/ss-helpers')

	/** The static page title */
	- title = @@appName

	/** @override */
	- rootAttrs = {}

	/** The page charset */
	- charset = 'utf-8'

	/** A dictionary with meta viewport attributes */
	- viewport = { &
		'width': 'device-width',
		'initial-scale': '1.0',
		'maximum-scale': '1.0',
		'user-scalable': 'no'
	} .

	/** A dictionary with attributes of <html> tag */
	- htmlAttrs = { &
		lang: config.locale
	} .

	/** Should or not generate the `<base>` tag */
	- defineBase = false

	/** Should or not attach favicons */
	- attachFavicons = true

	/** Should or not do a request for `assets.js` */
	- assetsRequest = false

	/** A dictionary with external libraries to load */
	- deps = include('src/components/super/i-static-page/deps')

	/** The page dependencies */
	- ownDeps = @@entryPoints[self.name()] || {}

	/** A dictionary with static page assets */
	- assets = h.getAssets(@@entryPoints)

	- block root
		- block pageData
			? rootAttrs['data-root-component'] = self.name()

		? await h.generateInitJS(self.name(), { &
			deps,
			ownDeps,

			assets,
			assetsRequest,

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

					- block varsDecl
						+= h.getVarsDecl({wrap: true})

					- block favicons
						- if attachFavicons
							+= h.getFaviconsDecl()

					- block title
						< title
							{title}

					- block assets
						+= h.getAssetsDecl({inline: !assetsRequest, wrap: true})

					- block links
						+= await h.loadLinks(deps.links, {assets, wrap: true})

					- block headStyles
						+= h.getStyleDeclByName('std', {assets, optional: true, wrap: true, js: true})

					- block headScripts
						+= await h.loadLibs(deps.headScripts, {assets, wrap: true, js: true})

			< body ${rootAttrs|!html}
				<! :: SSR
				- block headHelpers

				- block innerRoot
					- block helpers
					- block providers

					- if overWrapper
						< .&__over-wrapper
							- block overWrapper

						- block body

				- block deps
					- block styles
						+= await h.loadStyles(deps.styles, {assets, wrap: true})
						+= h.getPageStyleDepsDecl(ownDeps, {assets, wrap: true})

					- block scripts
						+= h.getScriptDeclByName('std', {assets, optional: true, wrap: true})
						+= await h.loadLibs(deps.scripts, {assets, wrap: true, js: true})

						+= h.getScriptDeclByName('vendor', {assets, optional: true, wrap: true})
						+= h.getScriptDeclByName('index-core', {assets, optional: true, wrap: true})

						+= h.getPageScriptDepsDecl(ownDeps, {assets, wrap: true})
