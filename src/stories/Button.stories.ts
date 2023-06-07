/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import '@v4fire/core/core';
import bButton from 'components/form/b-button/b-button';

// More on how to set up stories at: https://storybook.js.org/docs/html/writing-stories/introduction
// TODO: store all props inside the component bButton['Props']
export default {
	title: 'Form/bButton',
	component: bButton,
	tags: ['autodocs'],
	argTypes: {
		label: {
			defaultValue: ''
		}
	}
};

// More on writing stories with args: https://storybook.js.org/docs/html/writing-stories/args
export const Primary = {
	args: {
		children: {
			default: 'Hello'
		}
	}
};
