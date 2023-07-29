/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Meta, StoryObj } from '@v4fire/storybook';
import type bBottomSlide from 'components/base/b-bottom-slide/b-bottom-slide';
import readme from './README.md?raw';

const config: Meta<bBottomSlide> = {
	title: 'Base/bBottomSlide',
	component: 'b-bottom-slide',
	tags: ['autodocs'],
	parameters: {
		docs: {
			readme
		}
	},
	argTypes: {
		heightMode: {control: 'inline-radio', options: ['full', 'content']}
	}
};

export default config;

// More on writing stories with args: https://storybook.js.org/docs/html/writing-stories/args
export const Default: StoryObj<bBottomSlide> = {
	args: {
		heightMode: 'content',
		steps: [50],
		visible: 60,
		'slot-default': 'Hello'
	}
};
