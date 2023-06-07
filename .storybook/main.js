const
	path = require('node:path'),
	{inspect} = require('node:util');

const
	root = path.resolve(__dirname, '..'),
	src = path.resolve(root, 'src');

const layers = ['@v4fire/core'];

/**
 * @param {string[]} layers
 * @returns {RegExp}
 */
function layersToRegex(layers) {
  return new RegExp(layers.map((layer) => layer.split('/').join('[\\\\/]')).join('|'));
}

/**
 *
 * @param {string | RegExp | any} rule
 * @param {string} value
 * @returns
 */
function checkRuleApplies(rule, value) {
	if (typeof rule === 'string') {
		return value === rule;
	}

	if (rule instanceof RegExp) {
		return rule.test(value);
	}

	return null;
}

/**
 * @type {import('webpack').RuleSetRule}
 */
const snakeskinRule =
	{
		test: /\.ss$/,
		use: [
			{
				loader: 'monic-loader',
				options: {
					flags: {
						mode: 'development',
						runtime: {
							prod: false,
							debug: false,
							env: 'development',
							'core/helpers': true,
							'core/analytics': true,
							'core/log': true,
							'core/kv-storage': true,
							'core/session': true,
							'core/net': true,
							'prelude/date/relative': true,
							'prelude/date/format': true,
							'prelude/number/rounding': true,
							'prelude/number/format': true,
							engine: 'vue3',
							ssr: null,
							dynamicPublicPath: null,
							svgSprite: true,
							'ds/use-css-vars': false,
							blockNames: false,
							passDesignSystem: false,
							'prelude/test-env': true
						},
						demo: false,
						node_js: false,
						es: 'ES2019'
					},
					replacers: [
						require('../build/monic/dynamic-component-import')
					]
				}
			},
			{
				loader: 'snakeskin-loader',
				options: {
					pack: false,
					filters: { global: [ 'undef' ] },
					vars: {
						NODE_ENV: 'development',
						appName: 'Default app',
						locale: 'en',
						version: '4.0.0-beta.4',
						buildVersion: 'debug version',
						isProd: false,
						...require('../build/snakeskin/vars')
					},
					adapter: 'ss2vue3',
					adapterOptions: { ssr: null, ssrCssVars: {} },
					tagFilter: 'tagFilter',
					tagNameFilter: 'tagNameFilter',
					bemFilter: 'bemFilter'
				}
			}
		]
	}



/**
 * @type {import('@v4fire/storybook-framework-webpack5').StorybookConfig}
 */
const config = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@v4fire/storybook-framework-webpack5",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
	webpackFinal: async (config) => {
		await require('@v4fire/core/lib/core/prelude');
		await require('../build/snakeskin');

		const appLayersRegex = layersToRegex(layers);

		config.target = 'web';
		if (!config.resolve) {
			config.resolve = { modules: [], alias: {} };
		}

		config.module?.rules?.unshift(snakeskinRule);
		config.module?.rules?.forEach((rule) => {
			if (typeof rule !== 'object') {
				return;
			}

			if (rule.test?.toString() === '/\\.(mjs|tsx?|jsx?)$/') {
				const {exclude = []} = rule;

				rule.exclude = (excludePath) => {
					if (appLayersRegex.test(excludePath)) {
						return false;
					}

					const result = checkRuleApplies(exclude, excludePath);
					if (result != null) {
						return result;
					}

					if (Array.isArray(exclude)) {
						const result = exclude.reduce((acc, rule) => {
							const result = checkRuleApplies(rule, excludePath);
							return acc != null ? acc : result;
						}, null);

						if (result != null) {
							return result;
						}
					}

					return /node_modules/.test(excludePath);
				}
			}
		});

		config.resolve.modules = [
      path.resolve(src),
			...layers.map((layer) => path.resolve(root, 'node_modules', ...layer.split('/'), 'src')),
      ...config.resolve.modules ?? []
    ];

		config.resolve.alias = {
      '@v4fire/core': path.resolve(root, 'node_modules', ...layers[0].split('/'), 'src'),
			...config.resolve.alias,
    };

		config.resolve.fallback = {
      fs: false,
      tls: false,
      net: false,
      module: false,
      assert: false,
			stream: false,
			https: false,
			http: false,
			http2: false,
			url: false,
			constants: false,
			zlib: false,
			os: false,
			dns: false,
			crypto: false,
			child_process: false,
      path: require.resolve('path-browserify'),
    }

		// Inspect config
		console.log(inspect(config.module?.rules, {depth: 7}));

		return config;
	}
};
export default config;
