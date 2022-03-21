/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable @typescript-eslint/no-extraneous-class */

export class Snapshot {
	/**
	 * Сохраняет снэпшот как эталонный
	 *
	 * @param entry
	 * @param result
	 */
	static save(_entry: string, _result: Perf.Metrics.Data): Promise<Perf.Metrics.Data> {
		throw new Error('Not implemented');
	}

	/**
	 * Сравнивает переданные метрики с эталонным снэпшотом
	 *
	 * @param entry
	 * @param result
	 */
	static compareWithReference(_entry: string, _result: Perf.Metrics.Data): any {
		// ...
	}

	/**
	 * Сравнивает переданные метрики
	 *
	 * @param result1
	 * @param result2
	 */
	static compareBetween(_result1: Perf.Metrics.Data, _result2: Perf.Metrics.Data): any {
		// ...
	}
}
