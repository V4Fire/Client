/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type iBlock from 'components/super/i-block/i-block';

export interface GatheringStrategyData {
	/**
	 * The name of the component in which you want to render the data
	 */
	renderBy: string;

	/**
	 * Collected data
	 */
	data: Dictionary;
}

export interface GatheringStrategy {
	(component: iBlock): Promise<GatheringStrategyData>;
}

export interface RenderStrategy {
	(component: iBlock, data: Dictionary): Promise<void>;
}
