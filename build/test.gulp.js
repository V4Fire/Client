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
	{resolve} = require('@pzlr/build-core');

const
	cpus = os.cpus().length;

module.exports = function (gulp = require('gulp')) {
	const
		$ = require('gulp-load-plugins')({scope: ['optionalDependencies']});

	/**
	 * Build an application to test the specified component
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
			['--long-cache', false],
			['--public-path', ''],
			['--es', 'ES2019']
		].flat().join(' ');

		return $.run(`npx webpack ${argsString} ${suitArg} ${extraArgs}`, {verbosity: 3})
			.exec()
			.on('error', console.error);
	});

	/**
	 * Runs tests for the specified component
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
			'--reinit-browser': String
		}, {permissive: true});

		if (!args['--name']) {
			throw new ReferenceError('"--name" parameter is not specified');
		}

		args['--client-name'] = args['--client-name'] || args['--name'];

		const
			browsers = getSelectedBrowsers();

		let exitCode = 0;

		const cliParams = {
			'headless': true,
			'reinit-browser': false,
			'close': true
		};

		Object.keys(cliParams).forEach((key) => {
			cliParams[key] = args[`--${key}`] ? JSON.parse(args[`--${key}`]) : cliParams[key];
		});

		args['--port'] = args['--port'] || Number.random(2000, 6000);
		args['--page'] = args['--page'] || 'p-v4-components-demo';

		const
			fileServer = new nodeStatic.Server(src.output(args['--client-name']));

		const server = http.createServer(async (req, res) => {
			req.addListener('end', () => {
				fileServer.serve(req, res);
			}).resume();
		}).listen(args['--port']);

		const
			componentDir = resolve.blockSync(args['--name']),
			tmpDir = path.join(src.cwd(), 'tmp', path.relative(src.src(), componentDir));

		fs.mkdirpSync(tmpDir);

		const
			test = require(path.join(componentDir, 'test'));

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
			console.log(`Starting to test "${args['--name']}" on "${browserType}"`);
			console.log('-------------\n');

			return jasmine.env;
		}
	});

	/**
	 * Builds and runs tests for the specified component
	 */
	gulp.task('test:component', gulp.series([
		'test:component:build',
		'test:component:run'
	]));

	/**
	 * Builds and runs tests for all components
	 */
	gulp.task('test:components', async (cb) => {
		console.log(`CPUS available: ${cpus}`);

		const
			playwright = require('playwright');

		const
			cwd = resolve.cwd,
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
			browserArgs: cliArgs['--browser-args'] ? cliArgs['--browser-args'].split(',') : [],
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
			const c = cases[i];

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
					browser = servers[browserType] = await playwright[browserType].launchServer({args: getBrowserArgs()}),
					wsEndpoint = browser.wsEndpoint();

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
			const c = cases[i];

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
					}
				)
			);
		}

		await waitForEmpty(testMap);

		console.log('\n-------------');
		console.log(`\n✔ Tests passed: ${totalCases.filter((v) => !failedCases.includes(v)).length}`);
		console.log(`\n❌ Tests failed: ${failedCases.length}`);

		if (failedCases.length) {
			console.log(`\n❗ Failed tests:`);
			console.log(`\n${failedCases.join('\n')}`);
		}

		console.log('\n-------------\n');

		if (!cliParams.reInitBrowser) {
			Object.keys(servers).forEach(async (key) => await servers[key].close());
		}

		if (failedCases.length) {
			throw new Error(`Tests didn't passed`);
		}

		cb();
	});
};

/**
 * Waits till the specified callback function returns true
 *
 * @param {Function} cb
 * @param {number} interval
 * @returns {!Promise<void>}
 */
function wait(cb, interval = 15) {
	return new Promise((res) => {
		if (cb()) {
			res();
			return;
		}

		const intervalId = setInterval(() => {
			if (cb()) {
				res();
				clearInterval(intervalId);
			}
		}, interval);
	});
}

/**
 * Returns a browser instance by the specified parameters
 *
 * @param {string} browserType
 * @param {!Object} params
 * @param {!Object} options
 * @returns {!Promise<?>}
 */
async function getBrowserInstance(browserType, params, options = {}) {
	const
		playwright = require('playwright');

	const args = {
		'--firefoxWsEndpoint': '',
		'--webkitWsEndpoint': '',
		'--chromiumWsEndpoint': ''
	};

	Object.keys(args).forEach((key) => {
		try {
			args[key] = arg({[key]: String}, {permissive: true})[key];

		} catch {}
	});

	const endpointMap = {
		firefox: '--firefoxWsEndpoint',
		webkit: '--webkitWsEndpoint',
		chromium: '--chromiumWsEndpoint'
	};

	if (args[endpointMap[browserType]] && !options.reInit) {
		return await playwright[browserType].connect({wsEndpoint: args[endpointMap[browserType]], ...params});
	}

	return await playwright[browserType].launch({args: getBrowserArgs(), ...params});
}

/**
 * Returns a list of selected browsers
 * @returns {!Array<string>}
 */
function getSelectedBrowsers() {
	const
		args = arg({'--browsers': String}, {permissive: true}),
		browsers = ['chromium', 'firefox', 'webkit'];

	const aliases = {
		ff: 'firefox',
		firefox: 'firefox',
		chr: 'chromium',
		chrome: 'chromium',
		chromium: 'chromium',
		wk: 'webkit',
		webkit: 'webkit'
	};

	if (args['--browsers']) {
		const customBrowsers = args['--browsers']
			.split(',')
			.map((name) => aliases[name] || null)
			.filter((name) => name);

		if (customBrowsers.length) {
			return customBrowsers;
		}
	}

	return browsers;
}

/**
 * Returns a list of arguments that will be provided to a browser
 * @returns {!Array<string>}
 */
function getBrowserArgs() {
	try {
		const
			args = arg({'--browser-args': String}, {permissive: true});

		if (!args['--browser-args']) {
			return [];
		}

		return args['--browser-args'].split(',').map((v) => `--${v.trim()}`);

	} catch {
		return [];
	}
}
