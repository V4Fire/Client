/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Meta, StoryObj } from '@v4fire/storybook';
import type bSelect from 'components/form/b-select/b-select';
import readme from './README.md?raw';

// More on how to set up stories at: https://storybook.js.org/docs/html/writing-stories/introduction
// TODO: store all props inside the component bSelect['Props']
const config: Meta<bSelect> = {
	title: 'Form/bSelect',
	component: 'b-select',
	tags: ['autodocs'],
	parameters: {
		docs: {
			readme
		}
	},
	argTypes: {
		items: {
			control: 'array'
		},
		value: {
			control: 'text'
		}
	}
};

export default config;

// More on writing stories with args: https://storybook.js.org/docs/html/writing-stories/args
export const Default: StoryObj<bSelect> = {
	args: {
		value: '1',
		native: false,
		items: [
			{value: '1', label: 'Опция 1'},
			{value: '2', label: 'Опция 2'},
			{value: '3', label: 'Опция 3'}
		]
	}
};
