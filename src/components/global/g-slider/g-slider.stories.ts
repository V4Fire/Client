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
			readme,
			story: {
				iframeHeight: '340px'
			}
		}
	},
	argTypes: {}
};

export default config;

export const HorizontalSlider: StoryObj<any> = {
	args: {
		class: 'g-slider g-slider_horizontal_true',
		style: 'width: 400px; height: 300px',
		children: [
			{type: 'img', attrs: {src: 'https://fakeimg.pl/300x300', class: 'g-slider__slide_snap_end'}},
			{type: 'img', attrs: {src: 'https://fakeimg.pl/100x300', class: 'g-slider__slide_snap_start'}},
			{type: 'img', attrs: {src: 'https://fakeimg.pl/250x300', class: 'g-slider__slide_snap_center'}},
			{type: 'img', attrs: {src: 'https://fakeimg.pl/300x300'}},
			{type: 'img', attrs: {src: 'https://fakeimg.pl/300x300'}},
			{type: 'img', attrs: {src: 'https://fakeimg.pl/300x300'}},
			{type: 'img', attrs: {src: 'https://fakeimg.pl/300x300'}},
			{type: 'img', attrs: {src: 'https://fakeimg.pl/300x300'}}
		]
	}
};

export const VerticalSlider: StoryObj<any> = {
	args: {
		class: 'g-slider g-slider_vertical_true',
		style: 'width: 300px; height: 300px',
		children: [
			{type: 'img', attrs: {src: 'https://fakeimg.pl/300x150'}},
			{type: 'img', attrs: {src: 'https://fakeimg.pl/150x150'}},
			{type: 'img', attrs: {src: 'https://fakeimg.pl/300x150'}},
			{type: 'img', attrs: {src: 'https://fakeimg.pl/300x150'}},
			{type: 'img', attrs: {src: 'https://fakeimg.pl/300x150'}},
			{type: 'img', attrs: {src: 'https://fakeimg.pl/300x150'}}
		]
	}
};
