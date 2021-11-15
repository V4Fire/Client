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

class Snapshot {
	/**
	 * Сохраняет снэпшот как эталонный
	 *
	 * @param {string} entry
	 * @param {Perf.Metrics.Data} result
	 */
	static save(entry, result) {
		// ...
	}

	/**
	 * Сравнивает переданные метрики
	 *
	 * @param {string} entry
	 * @param {Perf.Metrics.Data} result
	 */
	static compare(entry, result) {
		// ...
	}
}

module.exports.Snapshot = Snapshot;
