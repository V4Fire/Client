'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	$C = require('collection.js'),
	ss = require('snakeskin'),
	escaper = require('escaper');

const
	fs = require('fs'),
	path = require('upath'),
	glob = require('glob');

const
	{validators, resolve} = require('@pzlr/build-core');

const
	folders = [resolve.blockSync(), ...resolve.dependencies],
	components = `/**/@(${validators.blockTypeList.join('|')})-*.@(ts|js)`;

const
	files = $C(folders).reduce((arr, el) => arr.concat(glob.sync(path.join(el, components))), []).reverse(),
	blocksTree = {};

const
	blockClassRgxp = /^\s*export\s+default\s+class\s+((.*?)\s+extends\s+.*?)\s*{/m,
	componentRgxp = /@component\(([\s\S]*)\)\n+\s*export\s+/,
	propsRgxp = /^(\t+)@prop\s*\([\s\S]+?\)+\n+\1([ \w$]+)(?:\??: [ \w|&$?()[\]{}<>'"`:.]+?)?\s*(?:=|;$)/gm,
	genericRgxp = /<.*/,
	extendsRgxp = /\s+extends\s+/;

$C(files).forEach((el) => {
	const
		file = fs.readFileSync(el, {encoding: 'utf-8'}),
		block = blockClassRgxp.exec(file),
		p = ((v) => v && new Function(`return ${v[1] || '{}'}`)())(block && componentRgxp.exec(file));

	if (!p) {
		return;
	}

	const
		component = block[2].replace(genericRgxp, ''),
		parent = block[1].split(extendsRgxp).slice(-1)[0].replace(genericRgxp, '');

	const obj = blocksTree[component] = blocksTree[component] || {
		props: {},
		parent
	};

	if (p.functional != null) {
		obj.functional = p.functional;
	}

	let s;
	while ((s = propsRgxp.exec(file))) {
		obj.props[s[2].split(' ').slice(-1)[0]] = true;
	}
});

function getFunctionalParameters(obj) {
	if (!obj) {
		return false;
	}

	const
		v = obj.functional,
		isObj = Object.isObject(v);

	if (obj.parent && (v === undefined || isObj)) {
		const
			p = getFunctionalParameters(blocksTree[obj.parent]);

		if (Object.isObject(p)) {
			return {...p, ...v};
		}

		if (isObj) {
			return v;
		}

		return p;
	}

	return v || false;
}

$C(blocksTree).forEach((el, key, data) => {
	data[key].functional = getFunctionalParameters(el);

	if (el.parent && data[el.parent]) {
		Object.setPrototypeOf(el.props, data[el.parent].props);
	}
});

const bind = {
	bind: [
		(o) => o.getVar('$attrs'),
		'typeof rootTag !== "undefined" ? rootTag : undefined'
	]
};

ss.importFilters({
	vueComp,
	vueTag: ss.setFilterParams(vueTag, bind),
	bem2vue: ss.setFilterParams(bem2vue, bind),
	getFirstTagElementName,
	b
});

const
	ssExtRgxp = /\.e?ss$/;

function b(url) {
	const
		hasMagic = glob.hasMagic(url),
		end = ssExtRgxp.test(url) ? '' : '/',
		ends = [];

	if (end) {
		const
			basename = path.basename(url);

		if (!glob.hasMagic(basename)) {
			ends.push(`${basename}.ss`);
		}

		if (!validators.blockName(basename)) {
			ends.push('main.ss', 'index.ss');
		}

	} else {
		ends.push('');
	}

	for (let i = 0; i < folders.length; i++) {
		for (let j = 0; j < ends.length; j++) {
			const
				fullPath = path.join(folders[i], url, ends[j] || '');

			if (hasMagic ? Boolean(glob.sync(fullPath).length) : fs.existsSync(fullPath)) {
				return fullPath;
			}
		}
	}

	return url + end;
}

const
	isVueProp = /^(:|@|v-)/,
	isLiteral = /^\s*[[{]/,
	vForRgxp = /^\s*([\w$]+)(\s+(?:in|of)\s+.*)$/,
	svgRequire = /require\(.*?\.svg[\\"']+\)/,
	isRef = {'ref': true, ':ref': true};

function normalizeSvgRequire(name, attrs) {
	if (name !== 'img') {
		return;
	}

	const
		src = attrs[':src'];

	if (src && svgRequire.test(src[0])) {
		src[0] += '.replace(/^"|"$/g, \'\')';
	}
}

function vueComp({name, attrs}) {
	normalizeSvgRequire(name, attrs);

	$C(attrs).forEach((el, key) => {
		if (isRef[key]) {
			attrs['data-vue-ref'] = [el];

			if (!attrs[':class']) {
				attrs[':class'] = attachClass(['componentId']);
			}
		}

		if (!isVueProp.test(key)) {
			return;
		}

		const
			tmp = key.dasherize();

		if (tmp !== key) {
			delete attrs[key];
			attrs[tmp] = el;
		}
	});

	let
		isSync = attrs['v-sync'];

	const
		asyncVal = attrs['v-async'],
		asyncBackVal = attrs['v-async-back'];

	delete attrs['v-sync'];
	delete attrs['v-async'];
	delete attrs['v-async-back'];

	$C(attrs).forEach((el, key) => {
		if (key.slice(0, 2) === ':-') {
			attrs[`:data-${key.slice(2)}`] = el;
			delete attrs[key];

		} else if (key === ':key') {
			const
				parts = el.join('').split(/\s*,\s*/),
				val = attrs[key] = parts.slice(-1);

			$C(parts.slice(0, -1)).forEach((key) => {
				if (key.slice(0, 2) === ':-') {
					attrs[`:data-${key.slice(2)}`] = val;

				} else {
					attrs[key] = val;
				}
			});
		}
	});

	if (name === 'component' || validators.blockName(name)) {
		let componentName;
		if (attrs[':instance-of']) {
			componentName = attrs[':instance-of'][0];
			delete attrs[':instance-of'];

		} else {
			componentName = name === 'component' ? 'iBlock' : name.camelize(false);
		}

		const
			c = blocksTree[componentName],
			smart = [attrs['v-func-placeholder'], delete attrs['v-func-placeholder']][0] && c && c.functional,
			vFunc = [attrs['v-func'], delete attrs['v-func']][0];

		const isStaticLiteral = (v) => {
			try {
				new Function(`return ${v}`)();
				return true;

			} catch (_) {
				return false;
			}
		};

		const vuePrfx = {
			':': true,
			'@': true,
			'v-': true
		};

		const isFunctional = c && c.functional === true || !vFunc && $C(smart).every((el, key) => {
			key = key.dasherize();

			if (!vuePrfx[key.slice(0, 2)] && !vuePrfx[key[0]]) {
				key = `:${key}`;
			}

			let
				attr = attrs[key] && attrs[key][0];

			try {
				attr = new Function(`return ${attr}`)();

			} catch (_) {}

			if (Object.isArray(el)) {
				if (!Object.isArray(el[0])) {
					return $C(el).includes(attr);
				}

				return Object.isEqual(el[0], attr);
			}

			if (Object.isRegExp(el)) {
				return el.test(attr);
			}

			if (Object.isFunction(el)) {
				return el(attr);
			}

			return Object.isEqual(el, attr);
		});

		if (isFunctional || vFunc) {
			if (smart) {
				if (vFunc) {
					attrs[':is'] = [`'${attrs['is'][0]}' + (${vFunc[0]} ? '-functional' : '')`];
					delete attrs['is'];

				} else {
					attrs['is'] = [`${attrs['is'][0]}-functional`];
				}
			}

			if (!asyncVal && !asyncBackVal) {
				isSync = true;
			}
		}

		$C(attrs).forEach((el, key) => {
			if (key[0] !== ':') {
				return;
			}

			el = $C(el).map((el) => {
				if (Object.isString(el) && isLiteral.test(el) && isStaticLiteral(el)) {
					return `memoizeLiteral(${el})`;
				}

				return el;
			});

			const
				base = key.slice(1),
				prop = `${base}Prop`;

			if (c && !c.props[base] && c.props[prop]) {
				attrs[`:${prop.dasherize()}`] = el;
				delete attrs[key];
			}
		});

		if (!attrs[':mods-prop']) {
			attrs[':mods-prop'] = ['provideMods()'];
		}
	}

	if (!isSync && !attrs.ref && !attrs[':ref'] && (asyncVal || asyncBackVal)) {
		const
			selfId = asyncVal ? asyncVal[0] : asyncBackVal[0],
			id = selfId !== true ? selfId : Math.random();

		const
			p = asyncBackVal ? 'Back' : '',
			key = attrs['v-else'] ? 'v-else-if' : attrs['v-else-if'] ? 'v-else-if' : 'v-if';

		attrs[key] = attachVIf(
			(attrs[key] || []).concat(`async${p}Components[regAsync${p}Component(${id}, '${name}')]`),
			asyncBackVal ? '||' : '&&'
		);

		delete attrs['v-else'];
	}
}

const
	isVoidLink = /^a:void$/,
	isButtonLink = /^button:a$/;

function vueTag(tag, attrs, rootTag) {
	const
		nm = tag.camelize(false),
		component = blocksTree[nm];

	if (component) {
		if (!Object.isBoolean(component.functional)) {
			attrs[':instance-of'] = [nm];
			attrs['v-func-placeholder'] = [true];
			attrs['is'] = [tag];
			return 'component';
		}

		return tag;
	}

	if (isVoidLink.test(tag)) {
		attrs.href = ['javascript:void(0)'];
		tag = 'a';

	} else if (isButtonLink.test(tag)) {
		attrs.type = ['button'];
		attrs.class = (attrs.class || []).concat('a');
		tag = 'button';

	} else if (tag === '_') {
		tag = rootTag;
	}

	return tag;
}

function attachVIf(arr, op) {
	const
		join = arr.join;

	arr.join = function () {
		return join.call(this, op);
	};

	return arr;
}

function bem2vue(block, attrs = {}, rootTag, val) {
	const
		tmp = attrs[':class'] = attrs[':class'] || [];

	if (!$C(tmp).includes('componentId')) {
		attrs[':class'] = attachClass(tmp.concat('componentId', `classes['${val.replace(/^_+/, '')}']`));
	}

	return block + val;
}

function attachClass(arr) {
	const
		join = arr.join;

	arr.join = function () {
		if (this.length < 2) {
			return join.call(this);
		}

		return `[${join.call(this, ',')}]`;
	};

	return arr;
}

const
	tagRgxp = /<[^>]+>/,
	elRgxp = new RegExp(`\\b${validators.baseBlockName}__[a-z0-9][a-z0-9-_]*\\b`);

function getFirstTagElementName(str) {
	const
		escapedStr = escaper.replace(str),
		tagMatch = tagRgxp.exec(escapedStr);

	if (!tagMatch) {
		return null;
	}

	return getElementClassName(escaper.paste(tagMatch[0]));
}

function getElementClassName(str) {
	const search = elRgxp.exec(str);
	return search ? search[0] : null;
}
