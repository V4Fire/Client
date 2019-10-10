- namespace ['i-static-page.interface']

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'super/i-block'|b as placeholder

- import config from 'config'
- import fs from 'fs-extra-promise'

/**
 * Generates a script tag with the specified attributes and body
 *
 * @param {Object=} [attrs] - tag attributes:
 *   *) [src] - script src
 *   *) [defer] - defer attribute
 *   *) [async] - async attribute
 *   *) [module] - module attribute
 *   *) [nonce] - nonce attribute
 *
 * @param {string=} [body]
 */
- block index->jsScript(attrs = {}, body = '')
		: &
			p = {},
			inline = false
		.

		- if nonce
			? p.nonce = nonce

		- forEach attrs => el, key
			- switch key
				> 'inline'
					? inline = el

				> 'defer'
					- if el
						? p.defer = TRUE

				> 'async'
					- if el
						? p.async = TRUE

				> 'module'
					- if el
						? p.module = TRUE

					- else el === false
						? p.nomodule = TRUE

				- default
					? p[key] = el

		- script js ${p}
			{body}

/**
 * Generates a link tag with the specified attributes and body
 *
 * @param {Object=} [attrs] - tag attributes:
 *   *) [href] - script src
 *   *) [defer] - defer attribute
 *   *) [nonce] - nonce attribute
 *
 * @param {string=} [body]
 */
- block index->cssLink(attrs = {}, body = '')
		: &
			p = {},
			defer = false,
			inline = false
		.

		- if nonce
			? p.nonce = nonce

		- forEach attrs => el, key
			- switch key
				> 'inline'
					? inline = el

				> 'defer'
					- if el
						? defer = TRUE

				- default
					? p[key] = el

		- if body
			- style css ${p}
				{body}

		- else if defer
			< link &
				rel = preload |
				as = style |
				onload = this.rel='stylesheet' |
				${p}
			.

		- else
			- link css ${p}

/**
 * Injects the specified file to the template
 * @param {string} src
 */
- block index->inject(src)
	- return fs.readFileSync(src).toString()

: &
	filesCache = Object.create(null),
	foldersCache = Object.create(null)
.

/**
 * Joins the specified paths and load a file/catalog by the final path to a library folder
 *
 * @params {!Object} opts - additional options:
 *   *) [relative=true]
 *
 * @param {...string} url
 */
- block index->loadToLib(@params)
	: &
		args = [].slice.call(arguments, 1),
		lastChunk = args[args.length - 1]
	.

	- if /^(\w+:)?\/\//.test(lastChunk)
		- return lastChunk

	: genHash = include('build/hash')

	: &
		src = path.join.apply(path, args),
		basename = path.basename(src)
	.

	: &
		isFile = true,
		file,
		newSrc,
		ref
	.

	- if /\/$/.test(src)
		? isFile = false
		? src = src.replace(/\/$/, '')

		- if !foldersCache[basename]
			: hash = @@hashFunction ? genHash(path.join(src, '/**/*')) + '_' : ''
			? newSrc = path.join(lib, hash + basename)

	- else if !filesCache[basename]
		? file = fs.readFileSync(src)
		: hash = @@hashFunction ? genHash(file) + '_' : ''
		? newSrc = path.join(lib, hash + basename)

	: cache = isFile ? filesCache : foldersCache
	? ref = @relative ? newSrc : path.relative(@@output, newSrc)
	? cache[basename] = fs.existsSync(newSrc) && ref

	- if !cache[basename]
		- if isFile
			? fs.mkdirpSync(lib)
			? fs.writeFileSync(newSrc, file.toString().replace(/\/\/# sourceMappingURL=.*/, ''))

		- else
			? fs.mkdirpSync(newSrc)
			? fs.copySync(src, newSrc)

		? cache[basename] = ref

	- return cache[basename]

/**
 * Adds a script dependence
 *
 * @param {string} name - dependence name
 * @param {Object=} [opts] - additional options:
 *   *) [defer]
 *   *) [optional]
 *   *) [inline]
 */
- block index->addScriptDep(name, opts)
	: p = Object.assign({defer: true}, opts)

	- if @@fatHTML || p.inline
		- if assets[name]
			: url = path.join(@@output, assets[name])

			- if fs.existsSync(url)
				requireMonic({url})

		- else if !p.optional
			- throw new Error('Script dependence with id "' + name +  '" is not defined')

	- else
		: putIn tpl
			document.write({("'<script src=\"' + PATH['" + name + "'] + '\" " + (p.defer ? 'defer' : '') +  "><' + '/script>'")|addNonce});

		- if p.optional
			# op
				if ('#{name}' in PATH) {
					#+= tpl
				}

		- else
			+= tpl

/**
 * Adds a link dependence
 *
 * @param {string} name - dependence name
 * @param {Object=} [opts] - additional options
 *   *) [optional]
 *   *) [inline]
 */
- block index->addStyleDep(name, opts)
	: &
		rname = name + '$style',
		p = Object.assign({}, opts)
	.

	- if @@fatHTML || p.inline
		- if assets[rname]
			: url = path.join(@@output, assets[rname])

			- if fs.existsSync(url)
				requireMonic({url})

		- else if !p.optional
			- throw new Error('Style dependence with id "' + name +  '" is not defined')

	- else
		: putIn tpl
			document.write({("'<link rel=\"stylesheet\" href=\"' + PATH['" + rname + "'] + '\">'")|addNonce});

		- if p.optional
			# op
				if ('#{rname}' in PATH) {
					#+= tpl
				}

		- else
			+= tpl

/**
 * Adds template dependencies
 * @param {string=} [type] - type of dependencies
 */
- block index->addDependencies(type)
	: list = @@dependencies[path.basename(__filename, '.ess')]

	- if !type || type === 'styles'
		- if @@fatHTML
			- style
				- forEach list => el
					+= self.addStyleDep(el)

		- else
			+= self.jsScript({})
				- forEach list => el
					+= self.addStyleDep(el)

	- if !type || type === 'scripts'
		+= self.jsScript({})
			- forEach list => el
				: tpl = el + '_tpl'

				- if el === 'index'
					+= self.addScriptDep(el)
					+= self.addScriptDep(tpl)

				- else
					+= self.addScriptDep(tpl)
					+= self.addScriptDep(el)

				window[#{globals.MODULE_DEPENDENCIES}].fileCache['{el}'] = true;
