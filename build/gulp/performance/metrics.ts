/* eslint-disable @typescript-eslint/no-extraneous-class */

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export class Metrics {

	/**
	 * Доступные метрики
	 */
	static get availableMetrics(): Perf.Metrics.Type[] {
		return [
			'fcp',
			'tti',
			'xhr',
			'long-task',
			'dom-interactive',
			'deltas'
		];
	}

	/**
	 * Начинает запись метрик
	 * @param metrics
	 */
	static startRecord(metrics: Perf.Metrics.Type[]): Promise<void> {
		// ...
	}

	/**
	 * Останавливает запись метрик
	 */
	static stopRecord(): Promise<void> {
		// ...
	}

	/**
	 * Возвращает снятые метрики в данный момент времени
	 */
	static takeRecords(): Promise<Perf.Metrics.Data> {
		// ...
	}
}
