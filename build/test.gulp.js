/* eslint-disable max-lines-per-function */
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
	path = require('upath'),
	arg = require('arg');

const
	{src} = require('config'),
	{resolve} = require('@pzlr/build-core'),
	{wait, getBrowserInstance, getSelectedBrowsers, getBrowserArgs} = include('build/helpers');

const
	cpus = os.cpus().length;

/**
 * Registers gulp tasks to test the project
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
	 * * [--client-output] - directory to save generated code
	 * * [--build-cache=false] - should or not generate static build cache to speed up secondary re-build
	 * * [--public-path] - WebPack publicPath value
	 * * [--es='ES2019'] - version of used ECMAScript specification to generate
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
	gulp.task('test:component:build', () => {
		const
			args = arg({'--name': String, '--suit': String, '--client-name': String}, {permissive: true});

		if (!args['--name']) {
			throw new ReferenceError('"--name" parameter is not specified');
		}

		const
			suitArg = args['--suit'] ? `--suit ${args['--suit']}` : '',
			extraArgs = args._.slice(1).join(' ');

		const argsString = [
			['--client-output', args['--client-name'] || args['--name']],
			['--components', args['--name']],
			['--build-cache', false],
			['--public-path', ''],
			['--es', 'ES2019']
		].flat().join(' ');

		return $.run(`npx webpack ${argsString} ${suitArg} ${extraArgs}`, {verbosity: 3})
			.exec()
			.on('error', console.error);
	});

	/**
	 * Runs tests for the specified component.
	 * Arguments:
	 *
	 * * --name - name of the component to test
	 * * [--port] - port to launch the test server
	 * * [--page='p-v4-components-demo'] - demo page to run tests
	 * * [--browsers] - list of browsers to test (firefox (ff), chromium (chrome), webkit (wk))
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
			process = require('process');

		const
			http = require('http'),
			nodeStatic = require('node-static');

		const
			fs = require('fs-extra-promise'),
			path = require('upath');

		const args = arg({
			'--name': String,
			'--port': Number,
			'--page': String,
			'--browsers': String,
			'--close': String,
			'--headless': String,
			'--client-name': String,
			'--reinit-browser': String,
			'--test-entry': String,
			'--runner': String
		}, {permissive: true});

		if (!args['--name']) {
			throw new ReferenceError('"--name" parameter is not specified');
		}

		args['--client-name'] = args['--client-name'] || args['--name'];

		const
			browsers = getSelectedBrowsers();

		let exitCode = 0;

		const cliParams = {
			headless: true,
			'reinit-browser': false,
			close: true
		};

		Object.keys(cliParams).forEach((key) => {
			cliParams[key] = args[`--${key}`] ? JSON.parse(args[`--${key}`]) : cliParams[key];
		});

		args['--port'] = args['--port'] || Number.random(2000, 6000);
		args['--page'] = args['--page'] || 'p-v4-components-demo';

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

		const testPath = args['--test-entry'] ?
			resolve.blockSync(args['--test-entry']) :
			path.join(componentDir, 'test');

		const
			test = require(testPath);

		const browserParams = {
			chromium: {},
			firefox: {},
			webkit: {}
		};

		const createBrowser = async (browserType) => {
			const browserInstanceParams = {
				headless: cliParams.headless
			};

			const browserInstanceOptions = {
				reInit: cliParams['reinit-browser']
			};

			const
				browser = await getBrowserInstance(browserType, browserInstanceParams, browserInstanceOptions),
				context = await browser.newContext(),
				page = await context.newPage();

			const
				testURL = `localhost:${args['--port']}/${args['--page']}.html`;

			browserParams[browserType] = {
				testURL,
				browser,
				browserType,
				page,
				context,
				componentDir,
				tmpDir
			};
		};

		const runTest = async (browserType) => {
			const
				params = browserParams[browserType];

			const {
				testURL,
				page
			} = params;

			await page.goto(testURL);
			const testEnv = getTestEnv(browserType);
			await test(page, params);

			const close = () => {
				if (!cliParams['reinit-browser'] && cliParams.close) {
					params.browser.close();
				}

				process.exitCode = exitCode;
			};

			testEnv.addReporter({
				specDone: (res) => {
					if (exitCode === 1) {
						return;
					}

					exitCode = res.status === 'failed' ? 1 : 0;
				}
			});

			await new Promise((resolve) => {
				testEnv.afterAll(() => resolve(), 10e3);
				testEnv.execute();
			}).then(close, close);
		};

		const
			browsersPromises = [];

		for (const browserType of browsers) {
			browsersPromises.push(createBrowser(browserType));
		}

		await Promise.all(browsersPromises);

		for (const browserType of browsers) {
			await runTest(browserType);
		}

		await server.close();

		function getTestEnv(browserType) {
			const
				Jasmine = require('jasmine'),
				jasmine = new Jasmine();

			jasmine.configureDefaultReporter({});
			Object.assign(globalThis, jasmine.env);

			console.log('\n-------------');
			console.log('Starting to test');
			console.log(`env component: ${args['--name']}`);
			console.log(`test entry: ${args['--test-entry']}`);
			console.log(`runner: ${args['--runner']}`);
			console.log(`browser: ${browserType}`);
			console.log('-------------\n');

			return jasmine.env;
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
	 *
	 * @see test:component
	 * @see test:component
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
			'--browser-args': String
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

		for (let i = 0; i < cases.length; i++) {
			let c = cases[i];

			if (!c.includes('--name')) {
				c = `${c} --name b-dummy`;
			}

			const args = arg({
				'--suit': String,
				'--name': String
			}, {argv: c.split(' '), permissive: true});

			args['--suit'] = args['--suit'] || 'demo';
			args['--client-name'] = `${args['--name']}_${args['--suit']}`;

			if (buildCache[args['--client-name']]) {
				continue;
			}

			const argsString = [
				['--suit', args['--suit']],
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

		for (let i = 0; i < cases.length; i++) {
			let c = cases[i];

			if (!c.includes('--name')) {
				c = `${c} --name b-dummy`;
			}

			const args = arg({
				'--suit': String,
				'--name': String
			}, {argv: c.split(' '), permissive: true});

			args['--suit'] = args['--suit'] || 'demo';
			args['--client-name'] = `${args['--name']}_${args['--suit']}`;

			const
				browserArgs = cliParams.browserArgs.join(','),
				argsString = `${c} --client-name ${args['--client-name']} --browsers ${browsers.join(',')} --browser-args ${browserArgs}`,
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
					})
			);
		}

		await waitForEmpty(testMap);

		console.log('\n-------------');
		console.log(`\n✔ Tests passed: ${totalCases.filter((v) => !failedCases.includes(v)).length}`);
		console.log(`\n❌ Tests failed: ${failedCases.length}`);

		if (failedCases.length) {
			console.log('\n❗ Failed tests:');
			console.log(`\n${failedCases.join('\n')}`);
		}

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
