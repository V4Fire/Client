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
 * @typedef {import('typescript').TransformationContext} TransformationContext
 * @typedef {import('typescript').Node} Node
 * @typedef {import('typescript').Decorator} Decorator
 */

/**
 * Adds an import statement with the specified name to the specified file
 *
 * @param {string} name - the name of the decorator to be imported and applied (e.g., `defaultValue`)
 * @param {string} path - the path from which the decorator should be imported (e.g., `core/component/decorators`)
 * @param {TransformationContext} context - the transformation context
 * @param {Node} node - the source file node in the AST
 * @returns {Node}
 */
exports.addNamedImport = function addNamedImport(name, path, context, node) {
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
};

/**
 * Returns true if the specified class is a component
 *
 * @param {Node} node - the class node in the AST
 * @returns {boolean}
 */
exports.isComponentClass = function isComponentClass(node) {
	const {decorators} = node;

	if (!ts.isClassDeclaration(node)) {
		return false;
	}

	if (decorators != null && decorators.length > 0) {
		return decorators.some(isComponentDecorator);
	}

	return false;
};

/**
 * Returns the value of the `partial` parameter from the parameters of the @component decorator
 *
 * @param {Node} node - the class node in the AST
 * @returns {boolean}
 */
exports.getPartialName = function getPartialName(node) {
	const {decorators} = node;

	if (!ts.isClassDeclaration(node)) {
		return false;
	}

	if (decorators != null && decorators.length > 0) {
		for (const decorator of node.decorators) {
			if (isComponentDecorator(decorator)) {
				const args = decorator.expression.arguments;

				if (args.length > 0) {
					const params = args[0];

					if (ts.isObjectLiteralExpression(params)) {
						for (const property of params.properties) {
							if (
								ts.isPropertyAssignment(property) &&
								ts.isIdentifier(property.name) &&
								property.name.text === 'partial' &&
								ts.isStringLiteral(property.initializer)
							) {
								return property.initializer.text;
							}
						}
					}
				}

				break;
			}
		}
	}

	return undefined;
};

const pathToRootRgxp = /(?<path>.+)[/\\]src[/\\]/;

/**
 * Takes a file path and returns the package name from the package.json file of the package the provided file belongs to
 *
 * @param {string} path
 * @returns {string}
 */
exports.getLayerName = function getLayerName(path) {
	const pathToRootDir = path.match(pathToRootRgxp).groups.path;
	return require(`${pathToRootDir}/package.json`).name;
};

/**
 * Returns true if the specified decorator is a component decorator
 *
 * @param {Decorator} decorator
 * @returns {boolean}
 */
function isComponentDecorator(decorator) {
	return (
		ts.isCallExpression(decorator.expression) &&
		ts.isIdentifier(decorator.expression.expression) &&
		decorator.expression.expression.text === 'component'
	);
}
