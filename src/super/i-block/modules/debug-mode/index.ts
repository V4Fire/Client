/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:super/i-block/modules/debug-mode/README.md]]
 * @packageDocumentation
 */

import Friend from 'super/i-block/modules/friend';
import composeDataEngine from 'super/i-block/modules/debug-mode/compose-data';

import type iBlock from 'super/i-block/i-block';
import type { GatheringStrategy, RenderStrategy } from 'super/i-block/modules/debug-mode/interface';

export * from 'super/i-block/modules/debug-mode/interface';

/**
 * Class provides methods to work with debug data
 */
export default class DebugMode extends Friend {
	/**
	 *
	 */
	protected dataGatheringStrategies!: GatheringStrategy[];

	/**
	 *
	 */
	protected dataRenderStrategies!: RenderStrategy[];

	constructor(component: iBlock) {
		super(component);

		this.initDebugDataGathering();
	}

	/**
	 *
	 */
	protected initDebugDataGathering(): void {
		if (this.dataGatheringStrategies.length === 0) {
			return;
		}

		Promise.allSettled(
			this.dataGatheringStrategies.map((strategy) => strategy(this.component))
		).then((results) => composeDataEngine(results, this.ctx))
			.then(() => this.initDebugDataRendering())
			.catch(stderr);
	}

	/**
	 *
	 */
	protected initDebugDataRendering(): void {
		if (this.dataRenderStrategies.length === 0) {
			return;
		}

		Promise.allSettled(
			this.dataRenderStrategies.map((strategy) => strategy(this.component, this.ctx))
		).then((results) => {
			const
				isSomeRenderSuccessful = results.some((result) => result.status === 'fulfilled');

			if (!isSomeRenderSuccessful) {
				return Promise.reject('Debug data was not rendered');
			}
			// TODO check iDebugMode
			// TODO set mod
			})
			.catch(stderr);
	}
}
