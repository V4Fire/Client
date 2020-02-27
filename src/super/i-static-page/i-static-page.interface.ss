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
	- lib = path.join(@@output, @@outputPattern({name: 'lib'}))

	- deps = include('src/super/i-static-page/deps')
	- globals = include('build/globals.webpack')
	- build = include('build/build.webpack')

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
				- while !fs.existsSync(path.join(@@output, assets[key]))
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
						- for var o = defStyles.entries(), el = o.next(); !el.done; el = o.next()
							: &
								key = el.value[0],
								src = el.value[1],
								p = Object.isString(src) ? {src: src} : src
							.

							: &
								inline = @@fatHTML || p.inline,
								cwd = !p.source || p.source === 'lib' ? @@lib : p.source === 'src' ? @@src : @@output
							.

							? src = p.src

							- if p.source === 'output'
								- while !assets[src]
									- while !fs.existsSync(build.assetsJSON)
										? await delay(500)

									? await delay(500)
									? Object.assign(assets, fs.readJSONSync(path.join(build.assetsJSON)))

								? src = assets[src]
								? src = path.join(cwd, Object.isObject(src) ? src.path : src)
								? src = inline ? src : path.relative(@@output, src)

							- else
								? src = self.loadToLib.apply(self, [{name: key, relative: !inline}].concat(cwd, src))

							? p = Object.reject(p, ['href', 'source'])

							- if inline
								- while !fs.existsSync(src)
									? await delay(500)

								+= self.cssLink(p)
									requireMonic({src})

							- else
								? src = @@publicPath(src)
								+= self.cssLink(Object.assign({defer: true}, p, {href: src}))

					- block styles
						+= self.addDependencies('styles')

					- block std
						+= self.jsScript({})
							+= self.addScriptDep('std', {optional: true})

					: defLibs = deps.scripts
					- block defLibs

					- block loadLibs
						- for var o = defLibs.entries(), el = o.next(); !el.done; el = o.next()
							: &
								key = el.value[0],
								src = el.value[1],
								isStr = Object.isString(src)
							.

							: &
								p = isStr ? {src: src} : src,
								needLoad = p.load !== false && !/\/$/.test(p.src)
							.

							: &
								basename = path.basename(p.src),
								inline = @@fatHTML || p.inline,
								cwd = !p.source || p.source === 'lib' ? @@lib : p.source === 'src' ? @@src : @@output
							.

							? src = p.src

							- if p.source === 'output'
								- while !assets[src]
									- while !fs.existsSync(build.assetsJSON)
										? await delay(500)

									? await delay(500)
									? Object.assign(assets, fs.readJSONSync(path.join(build.assetsJSON)))

								? src = assets[src]
								? src = path.join(cwd, Object.isObject(src) ? src.path : src)
								? src = inline ? src : path.relative(@@output, src)

							- else
								? src = self.loadToLib.apply(self, [{name: key, relative: !inline}].concat(cwd, src))

							? p = Object.reject(p, ['src', 'source', 'load'])

							- if !needLoad
								? src = @@publicPath(src)

								+= self.jsScript({})
									PATH['{key}'] = '{src}';

							- else
								- if inline
									- while !fs.existsSync(src)
										? await delay(500)

									+= self.jsScript(p)
										requireMonic({src})

								- else
									? src = @@publicPath(src)
									+= self.jsScript(Object.assign({defer: true}, p, {src: src}))

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
