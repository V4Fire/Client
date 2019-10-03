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

- import $C from 'collection.js'
- import fs from 'fs-extra-promise'
- import glob from 'glob'
- import path from 'upath'
- import delay from 'delay'

/**
 * Base page template
 */
- async template index(@params = {}) extends ['i-page'].index
	- lib = path.join(@@output, @@outputPattern({name: 'lib'}))
	- deps = include('src/super/i-static-page/deps')
	- globals = include('build/globals.webpack')

	- title = @@appName
	- pageData = Object.create(null)
	- assets = Object.create(null)
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

	- block root
		- if @@fatHTML
			- forEach @@dependencies => el, key
				: nm = @@outputPattern({name: key})
				? assets[key] = nm + '.js'
				? assets[key + '_tpl'] = nm + '_tpl.js'
				? assets[key + '$style'] = nm + '$style.css'

			- for var key in assets
				- while !await fs.existsAsync(path.join(@@output, assets[key]))
					? await delay(200)

			? assets['std'] = @@outputPattern({name: 'std'}) + '.js'
			? assets['vendor'] = @@outputPattern({name: 'vendor'}) + '.js'
			? assets['webpack.runtime'] = @@outputPattern({name: 'webpack.runtime'}) + '.js'

		- block doctype
			- doctype

		< html
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
					< title :: {title}

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

				+= self.jsScript({})
					# block initVars
						window[#{globals.MODULE_DEPENDENCIES}] = {fileCache: {}};

						# if nonce
							var GLOBAL_NONCE = #{nonce|json};

						var
							READY_STATE = 0,
							PATH = #{assets|json};

						try {
							PATH = new Proxy(PATH, {
								get: function (target, prop) {
									if (target.hasOwnProperty(prop)) {
										return target[prop];
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

					/**
					 * Loads the specified styles
					 * @param {style}
					 */
					- block loadStyles(styles) => defStyles
						+= $C(styles).to('').reduce()
							() => res, src
								: p = Object.isString(url) ? {src: src} : src
								? src = self.loadToLib.apply(self, [].concat(p.asset ? @@assets : @@lib, p.src))

								- if @@fatHTML || p.inline
									- style
										requireMonic({src})

								- else
									: src = @@publicPath(src)

									- if p.defer
										< link &
											rel = preload |
											href = ${src} |
											as = style |
											onload = this.rel='stylesheet'
										.

									- else
										- link css href = ${src}

								- return res + getTplResult()

					- block styles
						+= self.addDependencies('styles')

					- block std
						+= self.jsScript({})
							+= self.addScriptDep('std', {defer: false, optional: true})

					: defLibs = deps.scripts
					- block defLibs

					- block loadLibs(libs) => defLibs
						+= $C(libs).to('').reduce()
							() => res, src
								: &
									isStr = Object.isString(src),
									isFolder = isStr && /\/$/.test(src),
									p = isStr ? {src: src} : src
								.

								: basename = path.basename(p.src)
								? src = self.loadToLib.apply(self, [].concat(p.asset ? @@assets : @@lib, p.src))

								- if isFolder
									? src = @@publicPath(src)

									+= self.jsScript({})
										PATH['{basename}'] = '{src}';

								- else
									- if @@fatHTML || p.inline
										+= self.jsScript({})
											requireMonic({src})

									- else
										? src = @@publicPath(src)
										+= self.jsScript(Object.assign({}, p, {src: src}))

								- return res + getTplResult()

						+= self.jsScript({})
							# block initLibs
								if (typeof Vue !== 'undefined') {
									Vue.default = Vue;
								}

						- block scripts
							+= self.jsScript({})
								+= self.addScriptDep('vendor', {optional: true})

							+= self.addDependencies('scripts')

							+= self.jsScript({})
								+= self.addScriptDep('webpack.runtime')

					+= self.jsScript({})
						- block depsReady
							READY_STATE++;

			: pageName = self.name()

			- block pageData
				? rootAttrs['data-init-block'] = pageName
				? rootAttrs['data-block-params'] = ({data: pageData}|json)

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
