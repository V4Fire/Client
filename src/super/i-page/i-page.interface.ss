- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'super/i-base'|b as placeholder

- import fs from 'fs'
- import path from 'path'
- import hasha from 'hasha'
- import hashFiles from 'hash-files'
- import mkdirp from 'mkdirp'
- import copydir from 'copy-dir'

/**
 * Normalizes the specified url
 * @param {string} url
 */
- block index->normalize(url)
	- return url.replace(/\\/g, '/')

/**
 * Injects the specified file to the template
 *
 * @param {string} base - base path
 * @param {string} src
 */
- block index->inject(base, src)
	- return fs.readFileSync(path.join(base, src)).toString()

: &
	libCache = Object.create(null),
	foldersCache = Object.create(null)
.

/**
 * Joins the specified urls
 * @param {...string} url
 */
- block index->join()
	: last = arguments[arguments.length - 1]

	- if /(https?:)?\/\//.test(last)
		- return last

	: src = path.join.apply(path, arguments)
	: basename = path.basename(src)

	- if path.extname(basename)
		: newSrc, relativeSrc, file

		- if !libCache[basename]
			? file = fs.readFileSync(src)
			: hash = ''

			- if isProd
				? hash = hasha(src, {algorithm: 'md5'}).substr(0, @hashLength) + '_'

			? newSrc = path.join(@output, 'lib', hash + basename)
			? relativeSrc = path.relative(@output, newSrc)
			? libCache[basename] = fs.existsSync(newSrc) && relativeSrc

		- if !libCache[basename]
			? mkdirp.sync(path.join(@output, 'lib'))
			? fs.writeFileSync(newSrc, file.toString().replace(/\/\/# sourceMappingURL=.*/, ''))
			? libCache[basename] = relativeSrc

		- return self.normalize(libCache[basename])

	- return self.normalize(src)

/**
 * Adds template dependencies

 * @param {!Object} dependencies
 * @param {string=} [type] - type of dependencies
 */
- block index->addDependencies(dependencies, type)
	: list = dependencies[path.basename(__filename, '.ess')]

	- if !type || type === 'styles'
		- script
			- forEach list => el
				? el = self.normalize(el)
				document.write('<link rel="stylesheet" href="' + PATH['{el}$style'] + '">');

	- if !type || type === 'scripts'
		- script
			- forEach list => el
				? el = self.normalize(el)
				: tpl = el + '_tpl'

				- if el === 'index'
					document.write('<script src="' + PATH['{el}'] + '" defer="defer"><' + '/script>');
					document.write('<script src="' + PATH['{tpl}'] + '" defer="defer"><' + '/script>');

				- else
					document.write('<script src="' + PATH['{tpl}'] + '" defer="defer"><' + '/script>');
					document.write('<script src="' + PATH['{el}'] + '" defer="defer"><' + '/script>');

				ModuleDependencies.fileCache['{el}'] = true;

/**
 * Base page template
 * @param [params] - template parameters
 */
- placeholder index(@params = {}) extends ['i-base'].index
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
					< meta charset = utf-8
					< meta &
						name = viewport |
						content = width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no
					.

					< title :: {@@appName}
					< base href = ${base}

					/// Dirty hack for replacing startURL from manifest.json
					: putIn injectFavicons
						() =>
							: &
								rgxp = new RegExp('<link (.*?) href="(.*?/manifest.json)">'),
								favicons = self.inject(@assets, 'favicons/favicons.html'),
								manifest = rgxp.exec(favicons)
							.

							+= favicons.replace(rgxp, '')

							- script
								document.write('<link {manifest[1]} href="{manifest[2]}?from=' + location.href + '">');

					+= injectFavicons()

				# script
					var
						ModuleDependencies = {fileCache: Object.create(null)},
						API = location.protocol + '//' + location.host + '/api',
						READY_STATE = 0;

					var
						PATH = Object.create(null),
						FN_CACHE = Object.create(null);

					try {
						FN_CACHE.string = JSON.parse(localStorage.getItem('STRING_CACHE') || 'false') || Object.create(null);
						PATH = new Proxy(PATH, {
							get: function (target, prop) {
								if (target[prop]) {
									return target[prop];
								}

								console.log(target);
								throw new Error('Path "' + prop + '" is not find!');
							}
						});

					} catch (_) {}

				- script js src = \/config.js
				- script js src = \/${@version}assets.js

				- block head
					: styles = [ &
						'//fonts.googleapis.com/css?family=Open+Sans:300,300i,400,400i,600,600i,700,700i,800,800i&subset=cyrillic',
						'//cdnjs.cloudflare.com/ajax/libs/flag-icon-css/2.6.0/css/flag-icon.min.css'
					] .

					- block styles
					- forEach styles => url
						: notDefer = Array.isArray(url)
						? url = self.join(@lib, notDefer ? url[0] : url)

						- if notDefer
							- link css href = ${url}

						- else
							< link &
								rel = preload |
								href = ${url} |
								as = style |
								onload = this.rel='stylesheet'
							.

					+= self.addDependencies(@dependencies, 'styles')

					: libs = [ &
						['babel-polyfill/dist/polyfill.min.js'],
						['collection.js/dist/collection.min.js'],
						['sugar/dist/sugar.min.js'],
						'requestidlecallback/index.js',
						'dom4/build/dom4.js',
						'sugar/dist/locales/ru.js',
						'eventemitter2/lib/eventemitter2.js',
						'localforage/dist/localforage.min.js',
						'urijs/src/URI.min.js',
						'vue/dist/vue.runtime' + (isProd ? '.min' : '') + '.js',
						'fg-loadcss/src/loadCSS.js',
						'fg-loadcss/src/cssrelpreload.js'
					] .

					- if isProd
						? libs.unshift('raven-js/dist/raven.min.js')

					- block libs
					- forEach libs => url
						- if /\/$/.test(url)
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
								? mkdirp.sync(newSrc)
								? copydir.sync(src, newSrc)
								? foldersCache[basename] = relativeSrc

							- script :: PATH['{basename}'] = '{self.normalize(foldersCache[basename])}';

						- else
							: notDefer = Array.isArray(url)
							- script js &
								src = ${self.join(@lib, notDefer ? url[0] : url)} |
								${notDefer ? '' : 'defer'}
							.

					/// Initialize Sugar.js
					- script :: Sugar.extend();

					+= self.addDependencies(@dependencies, 'scripts')

					/// All libraries was loaded
					- script :: READY_STATE++;

			- pageData = {}
			- pageName = self.name()

			< body.i-page.${pageName} &
				-init-block = ${pageName} |
				-${pageName}-params = ${{data: pageData}|json}
			.
				- block body
