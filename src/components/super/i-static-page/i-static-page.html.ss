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

: canInlineSourceCode = !config.webpack.externalizeInline()
: inlineDepsDeclarations = Boolean(config.webpack.dynamicPublicPath())

: themeAttribute = config.theme.attribute
: theme = config.theme.postProcessor ? config.theme.postProcessorTemplate : config.theme.default()

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
		lang: config.locale,
		[themeAttribute]: theme
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
						: varsDeclStr = h.getVarsDecl({wrap: canInlineSourceCode})

						- if canInlineSourceCode
							+= varsDeclStr

						- else
							: loadPath = h.emitFile(varsDeclStr, self.name() + '.vars-decl.js').loadPath
							+= h.getScriptDecl({src: loadPath})

					- block favicons
						- if attachFavicons
							+= h.getFaviconsDecl(canInlineSourceCode, Boolean(config.webpack.dynamicPublicPath()))

					- block title
						- if !HYDRATION
							< title
								{title}

					- block assets
						+= h.getAssetsDecl({inline: canInlineSourceCode && !assetsRequest, wrap: true})

					- block links
						+= await h.loadLinks(deps.links, {assets, wrap: inlineDepsDeclarations, js: inlineDepsDeclarations})

					- block headStyles
						+= h.getStyleDeclByName('std', {assets, optional: true, wrap: inlineDepsDeclarations, js: inlineDepsDeclarations})

						- if !inlineDepsDeclarations
							+= await h.loadStyles(deps.styles, {assets, wrap: false, js: false, inline: true})
							+= h.getPageStyleDepsDecl(ownDeps, {assets, wrap: false, js: false, inline: true})

					<! :: STYLES

					- block headScripts
						+= await h.loadLibs(deps.headScripts, {assets, wrap: inlineDepsDeclarations, js: inlineDepsDeclarations})
						+= h.getScriptDeclByName('std', {assets, optional: true, wrap: inlineDepsDeclarations, js: inlineDepsDeclarations})
						+= await h.loadLibs(deps.scripts, {assets, wrap: inlineDepsDeclarations, js: inlineDepsDeclarations})

						+= h.getScriptDeclByName('vendor', {assets, optional: true, wrap: inlineDepsDeclarations, js: inlineDepsDeclarations})
						+= h.getScriptDeclByName('index-core', {assets, optional: true, wrap: inlineDepsDeclarations, js: inlineDepsDeclarations})

						+= h.getPageScriptDepsDecl(ownDeps, {assets, wrap: inlineDepsDeclarations, js: inlineDepsDeclarations})

			< body ${rootAttrs|!html}
				<! :: SSR
				- block headHelpers

				- block innerRoot
					- block helpers
					- block providers

					- block bodyHeader

					- if overWrapper
						< .&__over-wrapper
							- block overWrapper

						- block body

					- block bodyFooter

				- block deps
					- block styles
						- if inlineDepsDeclarations
							+= await h.loadStyles(deps.styles, {assets, wrap: true, js: true})
							+= h.getPageStyleDepsDecl(ownDeps, {assets, wrap: true, js: true})
