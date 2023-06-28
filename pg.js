/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const path = require('node:path');
const ts = require('typescript');
const fs = require('node:fs');

const preludeTransformer = require('./build/ts-transformers/prelude');

const filePath = path.resolve('./src/code.ts');

const program = ts.createProgram([filePath], require('./tsconfig.json'));
const checker = program.getTypeChecker();
const source = program.getSourceFile(filePath);
const printer = ts.createPrinter();

const transformer = preludeTransformer(program);

// Run source file through our transformer
const result = ts.transform(source, [transformer]);

// Write pretty printed transformed typescript to output directory
fs.writeFileSync(
	path.resolve('./gen.ts'),
	printer.printFile(result.transformed[0])
);
