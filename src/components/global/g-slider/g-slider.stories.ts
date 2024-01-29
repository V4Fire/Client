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
	component: 'div',
	tags: ['autodocs'],
	parameters: {
		docs: {
			readme
		}
	},
	argTypes: {
	}
};

export default config;

export const Default: StoryObj<any> = {
	args: {
		class: 'g-slider g-slider__horizontal_true',
		style: 'width: 300px',
		children: [
			{type: 'img', attrs: {src: 'https://fakeimg.pl/300x300'}},
			{type: 'img', attrs: {src: 'https://fakeimg.pl/300x300'}},
			{type: 'img', attrs: {src: 'https://fakeimg.pl/300x300'}},
			{type: 'img', attrs: {src: 'https://fakeimg.pl/300x300'}},
			{type: 'img', attrs: {src: 'https://fakeimg.pl/300x300'}},
			{type: 'img', attrs: {src: 'https://fakeimg.pl/300x300'}},
			{type: 'img', attrs: {src: 'https://fakeimg.pl/300x300'}},
			{type: 'img', attrs: {src: 'https://fakeimg.pl/300x300'}}
		]
	}
};
