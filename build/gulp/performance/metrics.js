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

class Metrics {

	/**
	 * Доступные метрики
	 * @returns {Perf.Metrics.Type[]}
	 */
	static get availableMetrics() {
		return [
			'fcp',
			'tti',
			'xhr',
			'long-task',
			'dom-interactive',
			'custom'
		];
	}

	/**
	 * Начинает запись метрик
	 *
	 * @param {Perf.Metrics.Type[]} metrics
	 * @returns {void}
	 */
	static startRecord(metrics) {
		// ...
	}

	/**
	 * Останавливает запись метрик
	 */
	static stopRecord() {
		// ...
	}

	/**
	 * Возвращает снятые метрики в данный момент времени
	 * @returns {Perf.Metrics.Data}
	 */
	static takeRecords() {
		// ...
	}
}

module.exports.Metrics = Metrics;
