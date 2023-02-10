'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const ts = require('typescript');

/**
 * @typedef {import('typescript').TransformationContext} Context
 * @typedef {import('typescript').Node} Node
 * @typedef {import('typescript').VisitResult} VisitResult
 * @typedef {import('typescript').Transformer} Transformer
 * @typedef {import('typescript').TypeChecker} TypeChecker
 * @typedef {import('typescript').PropertyDeclaration} PropertyDeclaration
 * @typedef {import('typescript').ConciseBody} ConciseBody
 */

/**
 * Wraps an old expression into function
 *
 * @param {Context} context
 * @param {Node} oldInitializerNode
 * @returns {ConciseBody}
 */
function createFunctionBody(context, oldInitializerNode) {
	const {factory} = context;

	return factory.createBlock(
		[factory.createReturnStatement(oldInitializerNode)],
		true
	);
}

/**
 * Creates AST for wrapped by function property declaration
 *
 * @param {Context} context
 * @param {Node} oldInitializerNode
 * @param {Node} originalNode
 * @returns {PropertyDeclaration}
 */
const createPropertyDeclaration = (context, oldInitializerNode, originalNode) => {
	const
		{factory} = context,
		body = createFunctionBody(context, oldInitializerNode),
		identifierName = ts.getNameOfDeclaration(originalNode).escapedText;

	if (!body) {
		return originalNode;
	}

	return factory.createPropertyDeclaration(
		originalNode.decorators,
		originalNode.modifiers,
		factory.createIdentifier(identifierName),
		undefined,
		undefined,
		factory.createFunctionExpression(
			undefined,
			undefined,
			'__classTransformerWrapFunction__',
			undefined,
			[],
			undefined,
			body
		)
	);
};

/**
 * Check is class has given decorator
 *
 * @param {Node} node
 * @param {TypeChecker} checker
 * @returns {boolean}
 */
const isClassDecorated = (classNode, decoratorName) => {
	const {decorators} = classNode;

	return decorators && decorators.length > 0 && decorators.some((item) => item === decoratorName);
};

/**
 * Check is given node belongs trait
 *
 * @param {Node} node
 * @param {TypeChecker} checker
 * @returns {boolean}
 */
const isTrait = (node) => node.getSourceFile().path.includes('/src/traits/');

/**
 * A TypeScript transformer to replace class property default value initializators
 * with function call
 *
 * @param {Context} context
 * @returns {Transformer}
 * @example
 * ```typescript
 * class A {
 *   value = {}
 * }
 * // Becomes
 * class A {
 *   value = function() { return {} }
 * }
 *
 * class A {
 *   date = new Date()
 * }
 * // Becomes
 * class A {
 *   date = function() { return new Date() }
 * }
 * ```
 */
const classPropertyTransformer = (context) => {
	/**
	 * @param {Node} node
	 * @returns {VisitResult}
	 */
	function visitor(node) {
		if (
			ts.isPropertyDeclaration(node) &&
			node.parent && ts.isClassDeclaration(node.parent) &&
			node.parent.decorators && node.parent.decorators.length > 0 &&
			(isClassDecorated(node.parent, '@component()') || isTrait(node))
		) {
			const initializer = ts.getEffectiveInitializer(node);

			return createPropertyDeclaration(context, initializer, node);
		}

		return ts.visitEachChild(node, visitor, context);
	}

	return (node) => ts.visitNode(node, visitor);
};

module.exports = () => classPropertyTransformer;
