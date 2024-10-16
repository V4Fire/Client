/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const ts = require('typescript');

/**
 * @typedef {import('typescript').Transformer} Transformer
 * @typedef {import('typescript').TransformationContext} TransformationContext
 * @typedef {import('typescript').Node} Node
 */

module.exports = resisterComponentDefaultValues;

/**
 * Registers default values for the properties of a class that is a component.
 * The registration of default values is achieved through the defaultValue decorator.
 *
 * @param {TransformationContext} context
 * @returns {Transformer}
 *
 * @example
 *
 * ```typescript
 * import iBlock, { component, prop } from 'components/super/i-block/i-block';
 *
 * @component()
 * class bExample extends iBlock {
 *   @prop(Array)
 *   prop = [];
 * }
 * ```
 *
 * Will transform to
 *
 * ```typescript
 * import { defaultValue } from 'core/component/decorators/default-value';
 * import iBlock, { component, prop } from 'components/super/i-block/i-block';
 *
 * @component()
 * class bExample extends iBlock {
 *   @defaultValue(() => [])
 *   @prop(Array)
 *   prop = [];
 * }
 * ```
 */
function resisterComponentDefaultValues(context) {
	let needImportDecorator = false;

	return (node) => {
		node = ts.visitNode(node, visitor);

		if (needImportDecorator) {
			return addDefaultValueDecoratorImport(context, node);
		}

		return node;
	};

	/**
	 * A visitor for the AST node
	 *
	 * @param {Node} node
	 * @returns {Node}
	 */
	function visitor(node) {
		if (ts.isPropertyDeclaration(node) && ts.hasInitializer(node) && isComponentClass(node.parent, 'component')) {
			needImportDecorator = true;
			return addDefaultValueDecorator(context, node);
		}

		return ts.visitEachChild(node, visitor, context);
	}
}

/**
 * Adds the @defaultValue decorator for the specified class property
 *
 * @param {TransformationContext} context - the transformation context
 * @param {Node} node - the property node in the AST
 * @returns {Node}
 */
function addDefaultValueDecorator(context, node) {
	const {factory} = context;

	const defaultValue = ts.getEffectiveInitializer(node);

	const getterValue = factory.createBlock(
		[factory.createReturnStatement(defaultValue)],
		true
	);

	const getter = factory.createArrowFunction(
		undefined,
		undefined,
		[],
		undefined,
		undefined,
		getterValue
	);

	const decoratorExpr = factory.createCallExpression(
		factory.createIdentifier('defaultValue'),
		undefined,
		[getter]
	);

	const decorator = factory.createDecorator(decoratorExpr);

	const decorators = factory.createNodeArray([decorator, ...(node.decorators || [])]);

	return factory.updatePropertyDeclaration(
		node,
		decorators,
		node.modifiers,
		node.name,
		node.questionToken,
		node.type,
		node.initializer
	);
}

/**
 * Adds the import for the @defaultValue decorator to the specified file
 *
 * @param {TransformationContext} context - the transformation context
 * @param {Node} node - the source file node in the AST
 * @returns {Node}
 */
function addDefaultValueDecoratorImport(context, node) {
	const {factory} = context;

	const decoratorSrc = factory.createStringLiteral('core/component/decorators/default-value');

	const importSpecifier = factory.createImportSpecifier(
		undefined,
		undefined,
		factory.createIdentifier('defaultValue')
	);

	const importClause = factory.createImportClause(
		undefined,
		undefined,
		factory.createNamedImports([importSpecifier])
	);

	const importDeclaration = factory.createImportDeclaration(
		undefined,
		undefined,
		importClause,
		decoratorSrc
	);

	const updatedStatements = factory.createNodeArray([
		importDeclaration,
		...node.statements
	]);

	return factory.updateSourceFile(node, updatedStatements);
}

/**
 * Returns true if the specified class is a component
 *
 * @param {Node} node - the class node in the AST
 * @returns {boolean}
 */
function isComponentClass(node) {
	const {decorators} = node;

	const getDecoratorName = (decorator) => (
		decorator.expression &&
		decorator.expression.expression &&
		ts.getEscapedTextOfIdentifierOrLiteral(decorator.expression.expression)
	);

	if (decorators != null && decorators.length > 0) {
		return decorators.some((item) => getDecoratorName(item) === 'component');
	}

	return false;
}
