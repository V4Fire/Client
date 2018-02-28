- namespace ['i-page.interface']

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'super/i-block'|b as placeholder

- import fs from 'fs-extra-promise'
- import path from 'path'
- import hasha from 'hasha'

/**
 * Normalizes the specified url
 * @param {string} url
 */
- block index->normalize(url)
	- return url.replace(/\\/g, '/')

/**
 * Injects the specified file to the template
 * @param {string} src
 */
- block index->inject(src)
	- return fs.readFileSync(src).toString()

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
			? fs.mkdirpSync(path.join(@output, 'lib'))
			? fs.writeFileSync(newSrc, file.toString().replace(/\/\/# sourceMappingURL=.*/, ''))
			? libCache[basename] = relativeSrc

		- return self.normalize(libCache[basename])

	- return self.normalize(src)

/**
 * Adds template dependencies
 *
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
