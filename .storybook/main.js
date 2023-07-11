/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/** @type { import('@v4fire/storybook-framework-webpack5').StorybookConfig } */
const config = {
	stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
	addons: [
		"@storybook/addon-links",
		"@storybook/addon-essentials",
		"@storybook/addon-interactions",
	],
	framework: {
		name: "@v4fire/storybook-framework-webpack5",
		options: {
			rootComponent: 'p-v4-components-demo'
		},
	},
	docs: {
		autodocs: "tag",
	}
};

export default config;
