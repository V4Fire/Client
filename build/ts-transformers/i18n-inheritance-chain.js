'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	ts = require('typescript'),
	config = require('@config/config'),
	{build} = config,
	{block} = require('@pzlr/build-core');

const
	componentsLockPath = block.getComponentsLockPath(build.componentLockPrefix()),
	blocks = block.getCacheFromPath(componentsLockPath).data;

const
	filesMap = [...blocks.entries()].reduce((acc, [name, block]) => {
		if (block.logic) {
			acc[block.logic] = {
				name,
				chain: [block.name]
			};

			let {parent} = block;

			while (parent) {
				acc[block.logic].chain.push(parent);
				parent = blocks.get(parent).parent;
			}
		}

		return acc;
	}, {});

function i18nInheritanceChainTransformer() {
	/**
	 * @param {Node} node
	 * @returns {VisitResult}
	 */
	function fileVisitor(file) {
		if (filesMap[file.path]) {
			console.log(file.path);
		}

		return file;
	}

	return (node) => ts.visitNode(node, fileVisitor);
}

module.exports = i18nInheritanceChainTransformer;
