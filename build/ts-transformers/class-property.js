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

const primitiveTypes = ['boolean', 'number', 'string', 'null', 'undefined'];

/**
 * Wrap old expression into function
 *
 * @param {Context} context
 * @param {Node} oldInitializerNode
 * @returns {ConciseBody}
 */
const createFunctionBody = (context, oldInitializerNode) => {
	const {factory} = context;
	let value;

	if (ts.isObjectLiteralExpression(oldInitializerNode)) {
		value = factory.createObjectLiteralExpression(
			oldInitializerNode.properties,
			false
		);
	}

	if (ts.isArrayLiteralExpression(oldInitializerNode)) {
		value = factory.createArrayLiteralExpression(
			oldInitializerNode.elements,
			false
		);
	}

	if (ts.isNewExpression(oldInitializerNode)) {
		const invokedExpression = ts.getInvokedExpression(oldInitializerNode).escapedText;
		value = factory.createNewExpression(
			factory.createIdentifier(invokedExpression),
			undefined,
			[]
		);
	}

	if (ts.isArrowFunction(oldInitializerNode) && !oldInitializerNode.parameters.length) {
		return oldInitializerNode.body;
	}

	if (value) {
		return factory.createBlock(
			[factory.createReturnStatement(value)],
			true
		);
	}

	return undefined;
};

/**
 * Creates AST for wrapped by function property declaration
 *
 * @param {Context} context
 * @param {Node} oldInitializerNode
 * @param {Node} originalNode
 * @returns {PropertyDeclaration}
 */
const createPropertyDeclaration = (context, oldInitializerNode, originalNode) => {
	const {factory} = context;
	const body = createFunctionBody(context, oldInitializerNode);
	const identifierName = ts.getNameOfDeclaration(originalNode).escapedText;

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
			undefined,
			undefined,
			[],
			undefined,
			body
		)
	);
};

/**
 * Check is property declaration type primitive
 *
 * @param {Node} node
 * @param {TypeChecker} checker
 * @returns {boolean}
 */
const isPropertyDeclarationTypePrimitive = (node, checker) => {
	const type = checker.typeToString(checker.getTypeAtLocation(node));

	return primitiveTypes.includes(type);
};

/**
 * A TypeScript converter to replace class property default value initializators
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
const classPropertyTransformer = (program) => (context) => {
	const typeChecker = program.getTypeChecker();

	/**
	 * @param {Node} node
	 * @returns {VisitResult}
	 */
	function visitor(node) {
		if (
			ts.isPropertyDeclaration(node) &&
			node.parent && ts.isClassDeclaration(node.parent) &&
			ts.hasInitializer(node) &&
			!isPropertyDeclarationTypePrimitive(node, typeChecker)
		) {
			const initializer = ts.getEffectiveInitializer(node);

			return createPropertyDeclaration(context, initializer, node);
		}

		return ts.visitEachChild(node, visitor, context);
	}

	return (node) => ts.visitNode(node, visitor);
};

module.exports = classPropertyTransformer;
