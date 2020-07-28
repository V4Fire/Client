- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'super/i-page'|b
- include 'super/i-static-page/modules/**/*.ss'|b

- import fs from 'fs-extra-promise'
- import glob from 'glob'
- import path from 'upath'
- import delay from 'delay'

/**
 * Base page template
 */
- async template index(@params = {}) extends ['i-page'].index
	- h = include('src/super/i-static-page/modules/ss-helpers')
	- globals = include('build/globals.webpack')

	/// Map of external libraries to load
	- deps = include('src/super/i-static-page/deps')

	/// List of page self dependencies to load
	- selfDeps = @@dependencies[self.name()] || {}

	/// Map with page own assets: styles, scripts, links, etc.
	- assets = Object.create(null)

	- title = @@appName
	- pageData = Object.create(null)

	- nonce = @nonce

	- defineBase = false
	- assetsRequest = true

	- charset = { &
		charset: 'utf-8'
	} .

	- viewport = { &
		'width': 'device-width',
		'initial-scale': '1.0',
		'maximum-scale': '1.0',
		'user-scalable': 'no'
	} .

	- htmlAttrs = {}

	- block root
		? await h.initAssets(assets, @@dependencies)
		? await h.generateInitJS(self.name(), {deps, selfDeps, assets})

		- block doctype
			- doctype

		- block htmlAttrs

		< html ${htmlAttrs}
			< head
				: base = @@publicPath()

				- block meta
					< meta ${charset}

				- block viewport
					: content = []

					- forEach viewport => el, key
						? content.push(key + '=' + el)

					< meta &
						name = viewport |
						content = ${content}
					.

				- block title
					< title
						{title}

				- if defineBase
					- block base
						< base href = ${base}

				- block favicons
					/// Dirty hack for replacing startURL from manifest.json
					: putIn injectFavicons
						() =>
							: faviconsSrc = glob.sync(path.join(@@favicons, '*.html'))[0]

							- if !faviconsSrc
								- return

							: &
								rgxp = new RegExp('<link (.*?) href="(.*?/manifest.json)">'),
								favicons = self.inject(faviconsSrc),
								manifest = rgxp.exec(favicons)
							.

							+= favicons.replace(rgxp, '')

							+= self.jsScript({})
								document.write({"'<link " + manifest[1] + " href=\"" + manifest[2] + "?from=' + location.href + '\">'"|addNonce});

					+= injectFavicons()

				- block headScripts
					: headLibs = deps.headScripts
					- block headLibs

					- block loadHeadScripts
						+= await h.loadLibs(headLibs, assets)

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

				+= self.jsScript({})
					# block initVars
						window[#{globals.MODULE_DEPENDENCIES}] = {fileCache: Object.create(null)};

						# if nonce
							var GLOBAL_NONCE = #{nonce|json};

						var
							READY_STATE = 0,
							PATH = #{assets|json};

						try {
							PATH = new Proxy(PATH, {
								get: function (target, prop) {
									if (target.hasOwnProperty(prop)) {
										var v = target[prop];
										return typeof v === 'string' ? v : v.publicPath || v.path;
									}

									console.log(target);
									throw new Error('Path "' + prop + '" is not find!');
								}
							});

						} catch(_) {}

				- if !@@fatHTML && assetsRequest
					- block assets
						+= self.jsScript({src: @@publicPath(@@assetsJS)})

				- block head
					: defStyles = deps.styles
					- block defStyles

					- block loadStyles
						+= await h.loadStyles(defStyles, {assets})

					- block styles
						+= h.loadEntryPointDependencies(selfDeps, {type: 'styles', wrap: true})

					- block std
						+= h.getScriptDeclByName('std', {optional: true, wrap: true})

					: defLibs = deps.scripts
					- block defLibs

					- block loadLibs
						+= await h.loadLibs(defLibs, {assets})

						+= self.jsScript({})
							# block initLibs
								if (typeof Vue !== 'undefined') {
									Vue.default = Vue;
								}

						- block scripts
							+= h.getScriptDeclByName('vendor', {optional: true, wrap: true})
							+= h.loadEntryPointDependencies(selfDeps, {type: 'scripts', wrap: true})
							+= h.getScriptDeclByName('webpack.runtime', {wrap: true})

					+= self.jsScript({})
						- block depsReady
							READY_STATE++;
