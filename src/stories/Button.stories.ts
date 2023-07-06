/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Meta } from '@v4fire/storybook';
import type bButton from 'components/form/b-button/b-button';

// More on how to set up stories at: https://storybook.js.org/docs/html/writing-stories/introduction
// TODO: store all props inside the component bButton['Props']
const config: Meta<bButton> = {
	title: 'Form/bButton',
	component: 'b-button',
	tags: ['autodocs'],
	argTypes: {
		type: {
			control: 'inline-radio',
			options: ['button', 'submit']
		}
	}
};

export default config;

// More on writing stories with args: https://storybook.js.org/docs/html/writing-stories/args
export const Primary = {
	args: {
		type: 'button',
		'slot-default': 'Hello'
	}
};
