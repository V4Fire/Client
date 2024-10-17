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
 * Registers parts of a class as parts of the associated component.
 * For example, all methods and accessors of the class are registered as methods and accessors of the component.
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
 *
 *   get answer() {
 *     return 42;
 *   }
 *
 *   just() {
 *     return 'do it';
 *   }
 * }
 * ```
 *
 * Will transform to
 *
 * ```typescript
 * import { defaultValue } from 'core/component/decorators/default-value';
 * import { method } from 'core/component/decorators/method';
 *
 * import iBlock, { component, prop } from 'components/super/i-block/i-block';
 *
 * @component()
 * class bExample extends iBlock {
 *   @defaultValue(() => [])
 *   @prop(Array)
 *   prop = [];
 *
 *   @method('accessor')
 *   get answer() {
 *     return 42;
 *   }
 *
 *   @method('method')
 *   just() {
 *     return 'do it';
 *   }
 * }
 * ```
 */
function resisterComponentDefaultValues(context) {
	let
		needImportDefaultValueDecorator = false,
		needImportMethodDecorator = false;

	return (node) => {
		node = ts.visitNode(node, visitor);

		if (needImportDefaultValueDecorator) {
			node = addDecoratorImport('defaultValue', 'core/component/decorators/default-value', context, node);
		}

		if (needImportMethodDecorator) {
			node = addDecoratorImport('method', 'core/component/decorators/method', context, node);
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
		if (
			ts.isPropertyDeclaration(node) &&
			ts.hasInitializer(node) &&
			!node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.StaticKeyword) &&
			isComponentClass(node.parent, 'component')
		) {
			needImportDefaultValueDecorator = true;
			return addDefaultValueDecorator(context, node);
		}

		if (
			(ts.isMethodDeclaration(node) || ts.isGetAccessorDeclaration(node) || ts.isSetAccessorDeclaration(node)) &&
			isComponentClass(node.parent, 'component')
		) {
			needImportMethodDecorator = true;
			return addMethodDecorator(context, node);
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

	let getter;

	if (ts.isFunctionLike(defaultValue)) {
		getter = defaultValue;

	} else if (
		ts.isNumericLiteral(defaultValue) ||
		ts.isBigIntLiteral(defaultValue) ||
		ts.isStringLiteral(defaultValue) ||
		defaultValue.kind === ts.SyntaxKind.UndefinedKeyword ||
		defaultValue.kind === ts.SyntaxKind.NullKeyword ||
		defaultValue.kind === ts.SyntaxKind.TrueKeyword ||
		defaultValue.kind === ts.SyntaxKind.FalseKeyword
	) {
		getter = defaultValue;

	} else {
		const getterValue = ts.isFunctionLike(defaultValue) ?
			defaultValue :

			factory.createBlock(
				[factory.createReturnStatement(defaultValue)],
				true
			);

		getter = factory.createFunctionExpression(
			undefined,
			undefined,
			'getter',
			undefined,
			[],
			undefined,
			getterValue
		);
	}

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
 * Adds the @method decorator for the specified class method or accessor
 *
 * @param {TransformationContext} context - the transformation context
 * @param {Node} node - the method/accessor node in the AST
 * @returns {Node}
 */
function addMethodDecorator(context, node) {
	const {factory} = context;

	let type;

	if (ts.isMethodDeclaration(node)) {
		type = 'method';

	} else {
		type = 'accessor';
	}

	const decoratorExpr = factory.createCallExpression(
		factory.createIdentifier('method'),
		undefined,
		[factory.createStringLiteral(type)]
	);

	const decorator = factory.createDecorator(decoratorExpr);

	const decorators = factory.createNodeArray([decorator, ...(node.decorators || [])]);

	if (ts.isMethodDeclaration(node)) {
		return factory.updateMethodDeclaration(
			node,
			decorators,
			node.modifiers,
			node.asteriskToken,
			node.name,
			node.questionToken,
			node.typeParameters,
			node.parameters,
			node.type,
			node.body
		);
	}

	if (ts.isGetAccessorDeclaration(node)) {
		return factory.updateGetAccessorDeclaration(
			node,
			decorators,
			node.modifiers,
			node.name,
			node.parameters,
			node.type,
			node.body
		);
	}

	return factory.updateSetAccessorDeclaration(
		node,
		decorators,
		node.modifiers,
		node.name,
		node.parameters,
		node.body
	);
}

/**
 * Adds the import for the decorator with the specified name to the specified file
 *
 * @param {string} name - the name of the decorator to be imported and applied (e.g., `defaultValue`)
 * @param {string} path - the path from which the decorator should be imported (e.g., `core/component/decorators`)
 * @param {TransformationContext} context - the transformation context
 * @param {Node} node - the source file node in the AST
 * @returns {Node}
 */
function addDecoratorImport(name, path, context, node) {
	const {factory} = context;

	const decoratorSrc = factory.createStringLiteral(path);

	const importSpecifier = factory.createImportSpecifier(
		undefined,
		undefined,
		factory.createIdentifier(name)
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
