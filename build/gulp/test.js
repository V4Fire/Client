/* eslint-disable max-lines-per-function */

// @ts-check

'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	os = require('os'),
	arg = require('arg'),
	parseArgs = require('@v4fire/config/core/parseArgs');

const
	path = require('upath'),
	glob = require('glob');

const
	{build, src} = require('@config/config'),
	{resolve} = require('@pzlr/build-core');

const {
	wait,
	getTestClientName,

	getBrowserInstance,
	getSelectedBrowsers,
	getBrowserArgs
} = include('build/helpers');

const
	cpus = os.cpus().length,
	START_PORT = 8000;

/**
 * Registers gulp tasks to test the project
 *
 * @see https://github.com/V4Fire/Client/blob/master/docs/tests/README.md
 *
 * @example
 * ```bash
 * # Builds an application to test the specified component
 * npx gulp test:component:build --name b-button
 *
 * # Runs tests for the specified component
 * npx gulp test:component:run --name b-button --browsers ff
 *
 * # Builds and runs tests for the specified component
 * npx gulp test:component --name b-button
 *
 * # Builds and runs tests for all components
 * npx gulp test:components -p 16
 * ```
 */
module.exports = function init(gulp = require('gulp')) {
	const
		$ = require('gulp-load-plugins')({scope: ['optionalDependencies']});

	/**
	 * Builds an application to test the specified component.
	 * Arguments:
	 *
	 * * --name - name of the component to test
	 * * [--client-output] - directory to save the generated code
	 * * [--cache-type='memory'] - webpack cache type
	 * * [--public-path] - webpack publicPath value
	 * * [--es='ES2019'] - version of the used ECMAScript specification to generate
	 *
	 * @example
	 * ```bash
	 * npx gulp test:component:build --name b-button --client-output b-button --watch
	 * ```
	 *
	 * If you prefer to create components at runtime, you can use a dummy component.
	 *
	 * @example
	 * ```bash
	 * npx gulp test:component:build --name b-dummy
	 * ```
	 */
	gulp.task('test:component:build', async () => {
		const args = arg({
			'--suit': String,
			'--client-name': String
		}, {permissive: true});

		try {
			const name = arg({'--name': String}, {permissive: true})['--name'];
			args['--name'] = name;
		} catch {}

		if (!args['--name']) {
			args['--name'] = 'b-dummy';
		}

		const
			suitArg = args['--suit'] ? `--env suit=${args['--suit']}` : '';

		const
			WebpackCLI = require('webpack-cli/lib/webpack-cli'),
			webpackCLI = new WebpackCLI();

		webpackCLI.webpack = await webpackCLI.loadWebpack();

		const
			webpackCommands = webpackCLI.getBuiltInOptions().map(({name, alias}) => ({name, alias})),
			exceptionOptions = ['name'];

		const extraArgs = Object.entries(
			parseArgs(args._.slice(1))
		).map(([key, value]) => {
			const shouldProvideToWebpack =
				!exceptionOptions.includes(key) &&
				webpackCommands.find((wCommand) => wCommand.name === key || wCommand.alias === key);

			if (shouldProvideToWebpack) {
				if (value && value !== true) {
					return `--${key}=${value}`;
				}

				return `--${key}`;
			}

			if (value === true) {
				return `--env ${key}`;
			}

			return `--env ${key}=${value}`;
		}).join(' ');

		const argsString = [
			`client-output=${args['--client-name'] || args['--name']}`,
			`components=${args['--name']}`,
			'cache-type=memory',
			'progress=false',
			'public-path',
			'es=ES2019',
			'build-mode=testing'
		].map((el) => ['--env', el]).flat().join(' ');

		console.log(`webpack version: ${require('webpack/package.json').version}`);

		const
			cmdString = `npx webpack ${argsString} ${suitArg} ${extraArgs}`;

		const promisifyRun = new Promise((res, rej) => $.run(cmdString, {verbosity: 3}).exec('', (err) => {
			if (err != null) {
				rej(err);
			}

			res();
		}));

		return promisifyRun;
	});

	/**
	 * Runs tests for the specified component.
	 * Arguments:
	 *
	 * * --name - name of the component to test
	 * * [--port] - port to launch the test server
	 * * [--start-port] - starting port for `portfinder`
	 * * [--page='p-v4-components-demo'] - demo page to run tests
	 * * [--browsers] - list of browsers to test (firefox (ff), chromium (chrome), webkit (wk))
	 * * [--device] - name of used device, for instance, "iPhone_11" or "Pixel_2"
	 * * [--close=true] - should or not close the running browsers after finishing the tests
	 * * [--headless=true] - should or not run browsers with the headless option
	 * * [--reinit-browser=false] - should or not reuse already existence browser instances
	 * * [--test-entry] - directory with entry points to build the application
	 *
	 * @example
	 * ```bash
	 * npx gulp test:component:run --name b-button --browsers ff,chrome
	 * ```
	 *
	 * If you prefer to create components at runtime, you can use a dummy component.
	 * Make sure that that all components you want to test are declared as dependencies
	 * into `index.js` file of the demo page.
	 *
	 * @example
	 * ```bash
	 * npx gulp test:component:run --name b-dummy --test-entry base/b-router/test'
	 * ```
	 */
	gulp.task('test:component:run', async () => {
		const
			pzlr = require('@pzlr/build-core');

		const
			process = require('process'),
			portfinder = require('portfinder');

		const
			http = require('http'),
			nodeStatic = require('node-static');

		const
			fs = require('fs-extra'),
			path = require('upath');

		const
			{devices} = require('playwright');

		const args = arg({
			'--name': String,
			'--port': Number,
			'--start-port': Number,
			'--page': String,
			'--browsers': String,
			'--device': String,
			'--close': String,
			'--headless': String,
			'--client-name': String,
			'--reinit-browser': String,
			'--test-entry': String,
			'--runner': String
		}, {permissive: true});

		if (!args['--name']) {
			args['--name'] = 'b-dummy';
		}

		args['--client-name'] = args['--client-name'] || args['--name'];

		const
			browsers = getSelectedBrowsers();

		let
			/** If the exit code is 1, some of the current runners (or test itself) fail. */
			exitCode = 0;

		const cliParams = {
			headless: true,
			close: true,
			'build-mode': 'testing',
			'reinit-browser': false
		};

		Object.keys(cliParams).forEach((key) => {
			cliParams[key] = args[`--${key}`] ? JSON.parse(args[`--${key}`]) : cliParams[key];
		});

		// eslint-disable-next-line require-atomic-updates
		args['--port'] = args['--port'] || await portfinder.getPortPromise({
			port: args['--start-port'] || START_PORT
		});

		// eslint-disable-next-line require-atomic-updates
		args['--page'] = args['--page'] || build.demoPage;

		const
			fileServer = new nodeStatic.Server(src.output(args['--client-name']));

		const server = http.createServer((req, res) => {
			req.addListener('end', () => {
				fileServer.serve(req, res);
			}).resume();
		}).listen(args['--port']);

		const
			componentDir = resolve.blockSync(args['--name']),
			tmpDir = path.join(src.cwd(), 'tmp', path.relative(src.src(), componentDir));

		fs.mkdirpSync(tmpDir);

		const
			entryPoint = args['--test-entry'],
			testPath = entryPoint ? resolve.blockSync(entryPoint) : path.join(componentDir, 'test'),
			runners = glob.sync(path.join(testPath, `runners/${args['--runner'] ?? '**/*'}.js`));

		const browserParams = {
			chromium: {},
			firefox: {},
			webkit: {}
		};

		if (runners.length) {
			for (let i = 0; i < runners.length; i++) {
				const
					runner = runners[i];

				globalThis.V4FIRE_TEST_ENV = {
					testPath,
					runner
				};

				await initBrowserAndTests();
			}

		} else {
			globalThis.V4FIRE_TEST_ENV = {
				testPath
			};

			await initBrowserAndTests();
		}

		await server.close();
		process.exitCode = exitCode;

		/**
		 * Initializes browsers and starts tests
		 * @returns {!Promise<void>}
		 */
		async function initBrowserAndTests() {
			const
				browsersPromises = [];

			for (const browserType of browsers) {
				browsersPromises.push(createBrowser(browserType));
			}

			await Promise.all(browsersPromises);

			for (const browserType of browsers) {
				await runTest(browserType);
			}
		}

		/**
		 * Returns the pre-configured `Jasmine` test environment
		 *
		 * @param {string} browserType
		 * @param {number} attempt
		 * @returns {jasmine.Env}
		 */
		function getTestEnv(browserType, attempt) {
			const
				Jasmine = require('jasmine'),
				jasmine = new Jasmine();

			jasmine.configureDefaultReporter({});
			Object.assign(globalThis, jasmine.env);

			globalThis.jasmine.DEFAULT_TIMEOUT_INTERVAL = (30).seconds();

			console.log('\n-------------');
			console.log('Starting to test');
			console.log(`attempt: ${attempt}`);
			console.log(`typescript version: ${require('typescript/package.json').version}`);

			pzlr.config.dependencies.forEach((dep) => {
				console.log(`${dep} version: ${require(`${dep}/package.json`).version}`);
			});

			console.log(`port: ${args['--port']}`);
			console.log(`env component: ${args['--name']}`);
			console.log(`test entry: ${args['--test-entry']}`);
			console.log(`runner: ${globalThis.V4FIRE_TEST_ENV.runner}`);
			console.log(`browser: ${browserType}`);
			console.log(`browser version: ${browserParams[browserType].version}`);
			console.log('-------------\n');

			return jasmine.env;
		}

		/**
		 * Creates and stores a browser instance
		 *
		 * @param {string} browserType
		 * @returns {!Promise<void>}
		 */
		async function createBrowser(browserType) {
			const browserInstanceParams = {
				headless: cliParams.headless
			};

			const browserInstanceOptions = {
				reInit: cliParams['reinit-browser']
			};

			const
				browser = await getBrowserInstance(browserType, browserInstanceParams, browserInstanceOptions),
				device = args['--device']?.replace(/_/g, ' ');

			if (device != null && devices[device] == null) {
				throw Error(`The specified devise "${device}" is not supported`);
			}

			const contextOpts = {
				...device ? devices[device] : null
			};

			const
				context = await browser.newContext(contextOpts),
				page = await context.newPage(),
				version = await browser.version();

			const
				testURL = `localhost:${args['--port']}/${args['--page']}.html`;

			browserParams[browserType] = {
				testURL,
				browser,
				browserType,
				page,
				context,
				componentDir,
				tmpDir,
				contextOpts,
				version
			};
		}

		/**
		 * Runs a test in the specified browser
		 *
		 * @param {string} browserType
		 * @returns {!Promise<void>}
		 */
		async function runTest(browserType) {
			const args = arg({
				'--retries': Number
			}, {permissive: true});

			const
				params = browserParams[browserType];

			let
				test = require(testPath);

			test = test.default ?? test;

			const {
				testURL,
				page
			} = params;

			const
				retries = args['--retries'] ?? 0;

			let
				isTestSuccessful = false,
				attemptsFinished = 0;

			/**
			 * @returns {!Promise<boolean>}
			 */
			const testExecutor = async () => {
				let isSuccessful = true;

				const
					testEnv = getTestEnv(browserType, attemptsFinished + 1);

				await page.goto(testURL);
				await test(page, params);

				testEnv.addReporter({
					specDone: (res) => {
						if (isSuccessful === false) {
							return;
						}

						if (res.status === 'failed') {
							isSuccessful = false;
						}
					}
				});

				return new Promise((resolve) => {
					testEnv.afterAll(() => {
						console.log('\n\n\n');
						resolve(isSuccessful);
					}, 10e3);

					testEnv.execute();
				});
			};

			while (!isTestSuccessful && attemptsFinished - 1 < retries) {
				// eslint-disable-next-line require-atomic-updates
				isTestSuccessful = await testExecutor();

				if (!isTestSuccessful) {
					attemptsFinished++;
				}
			}

			if (!cliParams['reinit-browser'] && cliParams.close) {
				params.browser.close();
			}

			if (!isTestSuccessful) {
				exitCode = 1;
			}
		}
	});

	/**
	 * Builds and runs tests for the specified component
	 *
	 * @see test:component:build
	 * @see test:component:run
	 *
	 * @example
	 * ```bash
	 * npx gulp test:component --name b-button --browsers ff,chrome
	 * ```
	 */
	gulp.task('test:component', gulp.series([
		'test:component:build',
		'test:component:run'
	]));

	/**
	 * Builds and runs tests for all components.
	 * Arguments:
	 *
	 * * [--processes] | [-p] - number of available CPUs to build the application and run tests
	 * * [--test-processes] | [-tp] - number of available CPUs to run tests
	 * * [--build-processes] | [-tb] - number of available CPUs to build the application
	 * * [--only-run] - allows run all test cases without the building stage
	 *
	 * @see test:component:run
	 * @see test:component:build
	 *
	 * @example
	 * ```bash
	 * npx gulp test:components -p 16
	 * ```
	 */
	gulp.task('test:components', async (cb) => {
		console.log(`CPUS available: ${cpus}`);

		const
			playwright = require('playwright');

		const
			{cwd} = resolve,
			cases = require(path.join(cwd, 'tests/cases.js'));

		const processesArgs = arg({
			'--processes': Number,
			'--test-processes': Number,
			'--build-processes': Number,

			'-p': '--processes',
			'-tp': '--test-processes',
			'-bp': '--build-processes'
		}, {permissive: true});

		const cliArgs = arg({
			'--reinit-browser': String,
			'--only-run': Boolean,
			'--bail': Boolean,
			'--browser-args': String,
			'--retries': Number
		}, {permissive: true});

		const cliParams = {
			reInitBrowser: cliArgs['--reinit-browser'] ? JSON.parse(cliArgs['--reinit-browser']) : false,
			browserArgs: cliArgs['--browser-args'] ? cliArgs['--browser-args'].split(',') : []
		};

		const
			buildProcess = processesArgs['--build-processes'] || processesArgs['--processes'] || cpus,
			testProcess = processesArgs['--test-processes'] || processesArgs['--processes'] || cpus;

		const
			waitForQuotas = (map, maxQueue) => wait(() => map.size < maxQueue),
			waitForEmpty = (map) => wait(() => map.size === 0);

		const exec = (execString, successCb, failCb) => new Promise((res, rej) => {
			$.run(execString, {verbosity: 3})
				.exec('', () => {
					successCb && successCb();
					res();
				})

				.on('error', (err) => {
					failCb && failCb(execString, err);
					rej();
				});
		});

		// Build components

		const
			buildCache = {},
			buildMap = new Map();

		if (!cliArgs['--only-run']) {
			for (let i = 0; i < cases.length; i++) {
				const
					c = cases[i];

				const args = arg({
					'--name': String
				}, {argv: c.split(' '), permissive: true});

				args['--client-name'] = getTestClientName(args['--name'], build.suit);
				args._.push(...cliArgs._.slice(1));

				if (buildCache[args['--client-name']]) {
					continue;
				}

				const argsString = [
					['--suit', build.suit],
					['--name', args['--name']],
					['--client-name', args['--client-name']]
				].flat().join(' ');

				const extraArgs = args._.join(' ');

				await waitForQuotas(buildMap, buildProcess);

				buildMap.set(
					argsString,
					exec(`npx gulp test:component:build ${argsString} ${extraArgs}`, () => buildMap.delete(argsString))
				);

				buildCache[args['--client-name']] = true;
			}
		}

		await waitForEmpty(buildMap);

		// Launch browser server

		let endpointArg = '';

		const wsEndpoints = {
			chromium: '',
			firefox: '',
			webkit: ''
		};

		const
			servers = {},
			browsers = getSelectedBrowsers();

		if (!cliParams.reInitBrowser) {
			for (const browserType of browsers) {
				const
					browser = await playwright[browserType].launchServer({args: getBrowserArgs()}),
					wsEndpoint = browser.wsEndpoint();

				servers[browserType] = browser;
				await playwright[browserType].connect({wsEndpoint});
				wsEndpoints[browserType] = wsEndpoint;
			}

			endpointArg = Object.entries(wsEndpoints).map(([key, value]) => `--${key}WsEndpoint ${value}`).join(' ');
		}

		// Run tests

		const
			totalCases = [],
			failedCases = [],
			testMap = new Map();

		const printFailed = () => {
			if (failedCases.length) {
				console.log('\n❗ Failed tests:');
				console.log(`\n${failedCases.join('\n')}`);
			}
		};

		for (let i = 0; i < cases.length; i++) {
			let
				c = cases[i];

			// Set the beginning of the searching range for a free port
			c = `${c} --start-port ${START_PORT + i * 10}`;

			const args = arg({
				'--name': String
			}, {argv: c.split(' '), permissive: true});

			args['--client-name'] = getTestClientName(args['--name'], build.suit);

			const
				browserArgs = cliParams.browserArgs.join(','),
				argsString = `${c} --client-name ${args['--client-name']} --browsers ${browsers.join(',')} --browser-args ${browserArgs} --retries ${cliArgs['--retries'] ?? 0}`,
				extraArgs = args._.join(' ');

			totalCases.push(argsString);
			await waitForQuotas(testMap, testProcess);

			const
				onTestEnd = (argsString) => testMap.delete(argsString);

			testMap.set(
				argsString,
				exec(`npx gulp test:component:run ${argsString} ${endpointArg} ${extraArgs}`,
					() => onTestEnd(argsString),
					() => {
						onTestEnd(argsString);
						failedCases.push(argsString);

						if (cliArgs['--bail']) {
							printFailed();
							process.exit();
						}
					})
			);
		}

		await waitForEmpty(testMap);

		console.log('\n-------------');
		console.log(`\n✔ Tests passed: ${totalCases.filter((v) => !failedCases.includes(v)).length}`);
		console.log(`\n❌ Tests failed: ${failedCases.length}`);

		printFailed();

		console.log('\n-------------\n');

		if (!cliParams.reInitBrowser) {
			Object.keys(servers).forEach((key) => servers[key].close());
		}

		if (failedCases.length) {
			throw new Error('Tests wasn\'t passed');
		}

		cb();
	});
};
