/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:super/i-block/modules/render-info/README.md]]
 * @packageDocumentation
 */

import Friend from 'super/i-block/modules/friend';
import composeDataEngine from 'super/i-block/modules/render-info/compose-data';

import type { GatheringStrategy, RenderStrategy } from 'super/i-block/modules/render-info/interface';

export * from 'super/i-block/modules/render-info/interface';

/**
 * Class provides methods for rendering custom data
 */
export default class RenderInfo extends Friend {
	/**
	 * Strategies for collecting data
	 */
	protected dataGatheringStrategies!: GatheringStrategy[];

	/**
	 * Strategies for rendering data
	 */
	protected dataRenderStrategies!: RenderStrategy[];

	/**
	 * Sets strategies for collecting data
	 * @param strategies
	 */
	setDataGatheringStrategies(strategies: GatheringStrategy[]): void {
		this.dataGatheringStrategies = strategies;
	}

	/**
	 * Sets strategies for rendering data
	 * @param strategies
	 */
	setDataRenderStrategies(strategies: RenderStrategy[]): void {
		this.dataRenderStrategies = strategies;
	}

	/**
	 * Starts data collection
	 */
	initDataGathering(): void {
		if (Object.isNullable(this.dataGatheringStrategies)) {
			return;
		}

		Promise.allSettled(
			this.dataGatheringStrategies.map((strategy) => strategy(this.component))
		).then((results) => composeDataEngine(results))
			.then((data) => this.initDataRendering(data))
			.catch(stderr);
	}

	/**
	 * Starts rendering data
	 * @param data
	 */
	protected initDataRendering(data: Dictionary): Promise<void> {
		if (Object.isNullable(this.dataRenderStrategies)) {
			return Promise.reject();
		}

		return Promise.allSettled(
			this.dataRenderStrategies.map((strategy) => strategy(this.component, data))
		).then((results) => {
			const
				isSomeRenderSuccessful = results.some((result) => result.status === 'fulfilled');

			return isSomeRenderSuccessful ?
				Promise.resolve() :
				Promise.reject('Data was not rendered');
		})
		.catch(stderr);
	}
}
