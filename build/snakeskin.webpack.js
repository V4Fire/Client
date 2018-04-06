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
	ss = require('snakeskin');

const
	fs = require('fs'),
	escaper = require('escaper'),
	path = require('path'),
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
	blockClass = /^\s*export\s+default\s+class\s+((.*?)\s+extends\s+.*?)\s*{/m,
	isFunctional = /^\s*@component\s*\(\s*{.*?\bfunctional\s*:\s*true/m,
	propsRgxp = /^(\t+)@prop\s*\([\s\S]+?\)+\n+\1([ \w$]+)(?:\??: [ \w|&$?()[\]{}<>'"`:.]+?)?\s*(?:=|;$)/gm,
	genericRgxp = /<.*/,
	extendsRgxp = /\s+extends\s+/;

$C(files).forEach((el) => {
	const
		file = fs.readFileSync(el, {encoding: 'utf-8'}),
		block = blockClass.exec(file);

	if (!block) {
		return;
	}

	const
		component = block[2].replace(genericRgxp, ''),
		parent = block[1].split(extendsRgxp).slice(-1)[0].replace(genericRgxp, '');

	const obj = blocksTree[component] = blocksTree[component] || {
		props: {},
		functional: isFunctional.test(file),
		parent
	};

	let s;
	while ((s = propsRgxp.exec(file))) {
		obj.props[s[2].split(' ').slice(-1)[0]] = true;
	}
});

$C(blocksTree).forEach((el, key, data) => {
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
	vForRgxp = /^\s*([\w$]+)(\s+(?:in|of)\s+.*)$/;

function vueComp({name, attrs}) {
	$C(attrs).forEach((el, key) => {
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
		isAsync = attrs['v-async'],
		isAsyncBack = attrs['v-async-back'];

	if (attrs['v-for']) {
		if (vForRgxp.test(attrs['v-for'].join(' '))) {
			attrs['v-for'] = [`(${RegExp.$1}, i)${RegExp.$2}`];
		}
	}

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
			c = blocksTree[componentName];

		if (!isAsync && !isAsyncBack && c && c.functional) {
			isSync = true;
		}

		const isStaticLiteral = (v) => {
			try {
				new Function(`return ${v}`)();
				return true;

			} catch (_) {
				return false;
			}
		};

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

	if (!isSync && !attrs.ref && !attrs[':ref'] && (isAsync || isAsyncBack)) {
		const
			id = `'${Math.random()}' + i`,
			p = isAsyncBack ? 'Back' : '',
			key = attrs['v-else'] ? 'v-else-if' : attrs['v-else-if'] ? 'v-else-if' : 'v-if';

		attrs[key] = attachVIf(
			(attrs[key] || []).concat(`async${p}Components[regAsync${p}Component(${id}, '${name}')]`),
			isAsyncBack ? '||' : '&&'
		);

		delete attrs['v-else'];
	}
}

const
	isVoidLink = /^a:void$/,
	isButtonLink = /^button:a$/;

function vueTag(tag, attrs, rootTag) {
	if (isVoidLink.test(tag)) {
		attrs.href = ['javascript:void(0)'];
		tag = 'a';

	} else if (isButtonLink.test(tag)) {
		attrs.type = ['button'];
		attrs.class = attachClass((attrs.class || []).concat('a'));
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

function bem2vue(block, attrs, rootTag, val) {
	const
		tmp = attrs[':class'] = attrs[':class'] || [];

	if (!$C(tmp).includes('blockId')) {
		attrs[':class'] = attachClass(tmp.concat('blockId', `classes['${val.replace(/^_+/, '')}']`));
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
