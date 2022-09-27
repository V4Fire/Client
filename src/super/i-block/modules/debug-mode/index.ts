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

import backendDebugDataEngine from 'super/i-block/modules/debug-mode/data-gathering-engines/backend-debug-data';
import bottomBlockRenderEngine from 'super/i-block/modules/debug-mode/render-engines/bottom-block';

import type {

	DebugData,
	GatheringStrategy,
	RenderStrategy

} from 'super/i-block/modules/debug-mode/interface';

/**
 * Class provides methods to work with debug data
 */
export default class DebugMode extends Friend {
	/**
	 *
	 */
	dataRenderComponent!: string;

	/**
	 *
	 */
	dataGatheringStrategy!: GatheringStrategy;

	/**
	 *
	 */
	dataRenderStrategy!: RenderStrategy;

	/**
	 *
	 */
	protected debugData!: DebugData;

	/**
	 *
	 */
	initDebugDataGathering(): void {
		if (this.dataGatheringStrategy == null) {
			const
				db = this.field.get('DB');

			if (db != null && Object.has(db, 'debug')) {
				this.setDataGatheringStrategy(backendDebugDataEngine);

			} else {
				return;
			}
		}

		this.debugData = this.dataGatheringStrategy(this.ctx);
		this.initDebugDataRendering();
	}

	/**
	 *
	 */
	protected initDebugDataRendering(): void {
		if (this.dataRenderComponent == null) {
			this.dataRenderComponent = 'b-debug-data';
		}

		if (this.dataRenderStrategy == null) {
			this.setDataRenderStrategy(bottomBlockRenderEngine);
		}

		this.dataRenderStrategy(this.debugData, this.component, this.ctx, this.dataRenderComponent);
	}

	/**
	 *
	 */
	protected setDataGatheringStrategy(strategy: GatheringStrategy): void {
		this.dataGatheringStrategy = strategy;
	}

	/**
	 *
	 */
	protected setDataRenderStrategy(strategy: RenderStrategy): void {
		this.dataRenderStrategy = strategy;
	}
}
