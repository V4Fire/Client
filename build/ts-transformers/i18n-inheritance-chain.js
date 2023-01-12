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
	buildGraph = include('build/graph'),
	SyncPromise = require('@v4fire/core/lib/core/promise/sync').default,
	graphPromise = SyncPromise.resolve(buildGraph);

let
	filesMapCache;

function getFilesMap() {
	if (filesMapCache == null) {
		filesMapCache = [...graphPromise.unwrap().components.entries()].reduce((acc, [name, block]) => {
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
	}

	return filesMapCache;
}

/**
 * @typedef {import('typescript').TransformationContext} Context
 * @typedef {import('typescript').Node} Node
 * @typedef {import('typescript').VisitResult} VisitResult
 * @typedef {import('typescript').Transformer} Transformer
 */

/**
 * @param {Context} context
 * @returns {Transformer}
 */
const i18nInheritanceChainTransformer = (context) => {
	const filesMap = getFilesMap();

	/**
	 * @param {Node} file
	 * @returns {VisitResult}
	 */
	function fileVisitor(file) {
		const block = filesMap[file.path];

		if (block && block.name !== 'i-block') {
			return ts.visitEachChild(file, blockVisitor(block, context), context);
		}

		return file;
	}

	return (node) => ts.visitNode(node, fileVisitor);
};

/**
 * @param block
 * @param {Context} context
 * @returns {Transformer}
 */
function blockVisitor(block, context) {
	return function nodeVisitor(node) {
		const {factory} = context;

		if (ts.isClassDeclaration(node)) {
			const keysetsDeclaration = factory.createPropertyDeclaration(
				undefined,
				undefined,
				factory.createIdentifier('componentI18nKeysets'),
				undefined,
				undefined,
				factory.createArrayLiteralExpression(
					block.chain.map((el) => factory.createStringLiteral(el)),
					false
				)
			);

			return factory.updateClassDeclaration(
				node,
				node.decorators,
				node.modifiers,
				node.name,
				node.typeParameters,
				node.heritageClauses,
				[keysetsDeclaration, ...node.members]
			);
		}

		return ts.visitEachChild(node, nodeVisitor, context);
	};
}

module.exports = () => i18nInheritanceChainTransformer(context);
