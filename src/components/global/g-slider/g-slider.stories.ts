/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Meta, StoryObj } from '@v4fire/storybook';
import readme from './README.md?raw';

const config: Meta = {
	title: 'Global/gSlider',
	component: 'g-slider',
	tags: ['autodocs'],
	parameters: {
		docs: {
			readme
		}
	}
};

export default config;

export const Default: StoryObj = {
	args: {
		'slot-default': 'Content or slides'
	}
};
