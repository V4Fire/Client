/** @type { import('@v4fire/storybook-framework-webpack5').StorybookConfig } */
const config = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
  ],
	staticDirs: [
		'../dist/storybook'
	],
  framework: {
    name: "@v4fire/storybook-framework-webpack5",
    options: {
			rootComponent: 'p-v4-components-demo'
		},
  },
  docs: {
    autodocs: "tag",
  },
	webpackFinal: async (config) => {
		config.target = 'web';

		return config;
	}
};
export default config;
