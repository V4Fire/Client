/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable @typescript-eslint/no-extraneous-class */
/* eslint-disable import/no-nodejs-modules */

import { spawn } from 'child_process';

import glob from 'glob';

export class Project {
	/**
	 * Собирает проект с переданными параметрами
	 */
	static build(): Promise<[number, string | object | number | boolean | Error]> {
		return new Promise((res, rej) => {
			const
				accumulatedData: Array<string | object | number | boolean | Error> = [];

			const
				process = spawn('npx webpack', ['-la']);

			const onMsg = (msg) => {
				console.log(msg);
				accumulatedData.push(msg);
			};

			process.stdout.on('message', onMsg);
			process.stderr.on('message', onMsg);
			process.on('error', onMsg);

			process.on('close', (code) => {
				if (code != null && code > 0) {
					rej([code, accumulatedData]);

				} else {
					res([0, accumulatedData]);
				}
			});
		});
	}

	/**
	 * Возвращает entry по переданному паттерну пути
	 * @param path
	 */
	static getTestEntries(path: string): string[] {
		const
			paths = glob.sync(path);

		return paths;
	}

	/**
	 * Возвращает функции для запуска тестов
	 *
	 * @param paths
	 */
	static getTestFns(paths: string[]): Function[] {
		return paths.map((path) => require(path));
	}
}
