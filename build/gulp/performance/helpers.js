// @ts-check

/// <reference path="../../../ts-definitions/perf.d.ts" />

'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	glob = require('glob');

/**
 * Возвращает entry по переданному паттерну пути
 * @param {string} path
 * @returns {string[]}
 */
function getEntries(path) {
	const
		paths = glob.sync(path);

	return paths;
}

module.exports.getEntries = getEntries;

/**
 * Возвращает функции для запуска тестов
 *
 * @param {string[]} paths
 * @returns {Function[]}
 */
function getTestFns(paths) {
	return paths.map((path) => require(path));
}

module.exports.getTestFns = getTestFns;

/**
 * Билдит проект
 * @return {Promise<void>}
 */
function build() {
	return Promise.resolve();
}

module.exports.build = build;
