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

// TODO delete
import backendDebugDataEngine from 'super/i-block/modules/debug-mode/data-gathering-engines/backend-debug-data';
import bottomBlockRenderEngine from 'super/i-block/modules/debug-mode/render-engines/bottom-block';

import type iBlock from 'super/i-block/i-block';
import type {

	GatheringStrategy,
	RenderStrategy,
	DebugData

} from 'super/i-block/modules/debug-mode/interface';

/**
 * Class provides methods to work with debug data
 */
export default class DebugMode extends Friend {
	constructor(component: iBlock) {
		super(component);

		void this.initDebugDataGathering();

		// TODO delete
		this.dataGatheringStrategies = [backendDebugDataEngine];
		this.dataRenderStrategy = bottomBlockRenderEngine;
	}

	/**
	 *
	 */
	protected dataGatheringStrategies: GatheringStrategy[];

	/**
	 *
	 */
	protected dataRenderStrategy: RenderStrategy;

	/**
	 *
	 */
	// TODO how the fuck do i add it in a children components ?
	addDataGatheringStrategy(strategy: GatheringStrategy): void {
		this.dataGatheringStrategies.push(strategy);
	}

	/**
	 *
	 */
	addDataRenderStrategy(strategy: RenderStrategy): void {
		this.dataRenderStrategy = strategy;
	}

	/**
	 *
	 */
	protected async initDebugDataGathering(): Promise<void> {
		if (this.dataGatheringStrategies.length === 0 || this.dataRenderStrategy == null) {
			return;
		}

		const
			data: DebugData[] = [];

		for (let strategy of this.dataGatheringStrategies) {
			const
				result = await strategy(this.ctx);

			if (Object.isDictionary(result)) {
				data.push(result);
			}
		}

		if (data.length === 0) {
			return;
		}

		await this.storage.set(data, `${this.globalName}DebugData`);
		await this.initDebugDataRendering();
	}

	/**
	 *
	 */
	protected async initDebugDataRendering(): Promise<void> {
		// TODO продумать для нескольких способов вывода: группировка по компоненту, объединение данных

		const
			isSuccessful = await this.dataRenderStrategy(this.component, this.ctx);

		if (isSuccessful) {
			// TODO check iDebugMode
			// TODO set mod
		}
	}
}
