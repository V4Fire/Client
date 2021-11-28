/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-extraneous-class */

import pzlr from '@pzlr/build-core';
import chalk from 'chalk';

export class Logger {
	/**
	 * Выводит в консоль версии установленных пакетов
	 */
	static logPackagesVersion(): void {
		const
			ts = `typescript version: ${require('typescript/package.json').version}`,
			webpack = `webpack version: ${require('webpack/package.json').version}`,
			deps = (dep) => `${dep} version: ${require(`${dep}/package.json`).version}`;

		console.log('\n');
		console.log(chalk.cyan('Installed packages versions:'));
		console.log('\n');

		console.log(chalk.cyan(ts));
		console.log(chalk.cyan(webpack));

		pzlr.config.dependencies.forEach((dep) => {
			console.log(chalk.cyan(deps(dep)));
		});

		console.log('\n');
	}
}
