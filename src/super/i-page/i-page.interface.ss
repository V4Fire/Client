- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'super/i-block'|b
- include 'super/i-page/modules/**/*.ss'|b

- import fs from 'fs-extra-promise'
- import path from 'path'
- import hashFiles from 'hash-files'

/**
 * Base page template
 * @param [params] - template parameters
 */
- placeholder index(@params = {}) extends ['i-block'].index
	- title = @title || @@appName

	- pageData = {}
	- overWrapper = false

	- apiURL = ''
	- configRequest = false
	- assetsRequest = true
	- defineBase = false

	- charset = { &
		charset: 'utf-8'
	} .

	- viewport = { &
		'width': 'device-width',
		'initial-scale': '1.0',
		'maximum-scale': '1.0',
		'user-scalable': 'no'
	} .

	- isProd = @@env === 'production'
	- root = path.relative(@output, @root)
	- lib = path.relative(@output, @lib)
	- assets = path.relative(@output, @assets)

	- block root
		- block doctype
			- doctype

		< html
			< head
				: base = self.join('/', path.relative(@root, @output), '/')

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
							: faviconsSrc = path.join(@assets, 'favicons/favicons.html')

							- if !fs.existsSync(faviconsSrc)
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
							PATH = {},
							API = #{apiURL|json};

						var
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

						} catch (_) {}

				- if configRequest
					- block config
						- script js src = config.js

				- if assetsRequest
					- block assets
						- script js src = ${@version}assets.js

				- block head
					: defStyles
					- block defStyles
						? defStyles = []

					- forEach defStyles => url
						: notDefer = Array.isArray(url)
						? url = self.join(@lib, notDefer ? url[0] : url)

						- block loadDefStyles
							- if notDefer
								< link css href = ${url}

							- else
								< link &
									rel = preload |
									href = ${url} |
									as = style |
									onload = this.rel='stylesheet'
								.

					- block styles
						+= self.addDependencies(@dependencies, 'styles')

					: defLibs
					- block defLibs
						? defLibs = [ &
							['babel-polyfill/dist/polyfill.min.js'],
							['collection.js/dist/collection.min.js'],
							['sugar/dist/sugar.min.js'],
							['vue/dist/vue.runtime' + (isProd ? '.min' : '') + '.js'],
							'requestidlecallback/index.js',
							'dom4/build/dom4.js',
							'sugar/dist/locales/ru.js',
							'eventemitter2/lib/eventemitter2.js',
							'urijs/src/URI.min.js',
							'fg-loadcss/src/loadCSS.js',
							'fg-loadcss/src/cssrelpreload.js'
						] .

					- forEach defLibs => url
						- if /\/$/.test(url)
							- block loadFolder

								? url = url.replace(/\/$/, '')
								: basename = path.basename(url)
								: src, newSrc, relativeSrc

								- if !foldersCache[basename]
									? src = path.join(@lib, url)
									: hash = ''

									- if isProd
										? hash = hashFiles.sync({files: [path.join(src, '/**/*')]}).substr(0, @hashLength) + '_'

									? newSrc = path.join(@output, 'lib', hash + basename)
									? relativeSrc = path.relative(@output, newSrc)
									? foldersCache[basename] = fs.existsSync(newSrc) && relativeSrc

								- if !foldersCache[basename]
									? fs.mkdirpSync(newSrc)
									? fs.copySync(src, newSrc)
									? foldersCache[basename] = relativeSrc

								- script :: PATH['{basename}'] = '{self.normalize(foldersCache[basename])}';

						- else
							- block loadDefLibs
								: notDefer = Array.isArray(url)

								- script js &
									src = ${self.join(@lib, notDefer ? url[0] : url)} |
									${notDefer ? '' : 'defer'}
								.

					# script
						# block initLibs
							Vue.default = Vue;
							Sugar.extend();

					- block scripts
						+= self.addDependencies(@dependencies, 'scripts')

					# script
						# block depsReady
							READY_STATE++;

			: pageName = self.name()
			- block pageData
				? rootAttrs['data-init-block'] = pageName
				? rootAttrs['data-block-params'] = ({data: pageData}|json)

			< body
				< ${rootTag}.i-page.${pageName} ${rootAttrs|!html}
					- block headHelpers
					- block innerRoot
						- if overWrapper
							< .&__over-wrapper
								- block overWrapper

							- block body
						- block helpers
