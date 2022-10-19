/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type iBlock from 'super/i-block/i-block';

/**
 * Data collection result
 */
export interface GatheringStrategyData {
	/**
	 * Component in which you want to render the data
	 */
	renderBy: string;

	/**
	 * Collected data
	 */
	data: Dictionary;
}

/**
 * Data collection strategy
 */
export type GatheringStrategy = (
	/**
	 * Current component
	 */
	component: iBlock
) => Promise<GatheringStrategyData>;

/**
 * Data rendering strategy
 */
export type RenderStrategy = (
	/**
	 * Current component
	 */
	component: iBlock,

	/**
	 * Data for rendering
	 */
	data: Dictionary
) => Promise<void>;
