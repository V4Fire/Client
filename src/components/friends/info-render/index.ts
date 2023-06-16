/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/friends/info-render/README.md]]
 * @packageDocumentation
 */

import Friend from 'components/friends/friend';

import composeDataEngine from 'components/friends/info-render/compose';
import type { GatheringStrategy, RenderStrategy } from 'components/friends/info-render/interface';

export * from 'components/friends/info-render/interface';

export default class InfoRender extends Friend {
	/**
	 * Data collection strategies
	 */
	protected dataGatheringStrategies!: GatheringStrategy[];

	/**
	 * Data rendering strategies
	 */
	protected dataRenderStrategies!: RenderStrategy[];

	/**
	 * Sets strategies for collecting data
	 * @param strategies
	 */
	setDataGatheringStrategies(...strategies: GatheringStrategy[]): void {
		this.dataGatheringStrategies = strategies;
	}

	/**
	 * Sets strategies for rendering data
	 * @param strategies
	 */
	setDataRenderStrategies(...strategies: RenderStrategy[]): void {
		this.dataRenderStrategies = strategies;
	}

	/**
	 * Initializes data collection
	 */
	initDataGathering(): void {
		if (Object.isNullable(this.dataGatheringStrategies)) {
			return;
		}

		Promise.allSettled(
			this.dataGatheringStrategies.map((strategy) => strategy(this.component))
		).then((results) => composeDataEngine(...results))
			.then((data) => this.initDataRendering(data))
			.catch(stderr);
	}

	/**
	 * Initializes data rendering
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
