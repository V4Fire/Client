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

import type iBlock from 'super/i-block/i-block';
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
	protected debugData!: DebugData;

	/**
	 *
	 */
	protected dataGatheringStrategy!: GatheringStrategy;

	/**
	 *
	 */
	protected dataRenderStrategy!: RenderStrategy;

	/**
	 *
	 */
	protected dataRenderComponent!: iBlock;

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

	/**
	 *
	 */
	protected initDebugDataGathering(): void {

	}

	/**
	 *
	 */
	protected initDebugDataRendering(): void {

	}
}
