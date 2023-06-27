/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// These imports should be automatically included during the build
import '@v4fire/core/core';
import '../core/std';
import 'components/pages/p-v4-components-demo/p-v4-components-demo';
import 'core/init';
import { app } from 'core/component';

// Component import
import bButton from 'components/form/b-button/b-button';

globalThis['V4FireApp'] = app;

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
