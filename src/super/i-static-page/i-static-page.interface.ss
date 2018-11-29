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
- import hashFiles from 'hash-files'
- import delay from 'delay'

/**
 * Base page template
 */
- async template index() extends ['i-page'].index
	- assets = Object.create(null)
	- lib = path.join(@@output, @@outputPattern({name: 'lib'}))
	- deps = include('src/super/i-static-page/deps')

	- title = @@appName
	- pageData = {}

	- defineBase = false
	- assetsRequest = true
	- overWrapper = false

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
				: base = self.join('/', path.relative(@@root, @@output), '/')

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

							- script
								document.write('<link {manifest[1]} href="{manifest[2]}?from=' + location.href + '">');

					+= injectFavicons()

				# script
					# block initVars
						var
							READY_STATE = 0,
							PATH = #{assets|json},
							ModuleDependencies = {fileCache: {}};

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
						: assetJS = path.relative(@@output, @@assetsJSON.replace(/json$/, 'js'))
						- script js src = ${assetJS}

				- block head
					: defStyles = deps.styles
					- block defStyles

					+= $C(defStyles).to('').reduce()
						() => res, url
							: notDefer = Array.isArray(url)
							? url = self.join(@@lib, notDefer ? url[0] : url)

							- block loadDefStyles
								- if @@fatHTML
									- style
										requireMonic({url})

								- else
									- if notDefer
										- link css href = ${url}

									- else
										< link &
											rel = preload |
											href = ${url} |
											as = style |
											onload = this.rel='stylesheet'
										.

							- return res + getTplResult()

					- block styles
						+= self.addDependencies('styles')

					- block std
						- script
							+= self.addScriptDep('std', {defer: false, optional: true})
							+= self.addScriptDep('vendor', {optional: true})

					: defLibs = deps.scripts
					- block defLibs

					+= $C(defLibs).to('').reduce()
						() => res, url
							- if Object.isString(url) && /\/$/.test(url)
								- block loadFolder
									? url = url.replace(/\/$/, '')

									: &
										src,
										newSrc,
										relativeSrc,
										basename = path.basename(url)
									.

									- if !foldersCache[basename]
										? src = path.join(@@lib, url)
										: hash = ''

										- if @@hashLength
											? hash = hashFiles.sync({files: [path.join(src, '/**/*')]}).substr(0, @@hashLength) + '_'

										? newSrc = path.join(lib, hash + basename)
										? relativeSrc = path.relative(@@output, newSrc)
										? foldersCache[basename] = fs.existsSync(newSrc) && relativeSrc

									- if !foldersCache[basename]
										? fs.mkdirpSync(newSrc)
										? fs.copySync(src, newSrc)
										? foldersCache[basename] = relativeSrc

									- script :: PATH['{basename}'] = '{foldersCache[basename]}';

							- else
								- block loadDefLibs
									: notDefer = Array.isArray(url)
									? url = self.join(@@lib, notDefer ? url[0] : url)

									- if @@fatHTML
										- script
											requireMonic({url})

									- else
										- script js src = ${url} | ${notDefer ? '' : 'defer'}

							- return res + getTplResult()

					# script
						# block initLibs
							if (typeof Vue !== 'undefined') {
								Vue.default = Vue;
							}

					- block scripts
						+= self.addDependencies('scripts')

						- script
							+= self.addScriptDep('webpack.runtime')

					# script
						# block depsReady
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
