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
	{src} = require('config'),
	{resolve} = require('@pzlr/build-core');

const
	cpus = os.cpus().length;

module.exports = function (gulp = require('gulp')) {
	const
		$ = require('gulp-load-plugins')({scope: ['optionalDependencies']});

	gulp.task('test:component:build', () => {
		const
			arg = require('arg'),
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
			['--public-path', '']

		].flat().join(' ');

		return $.run(`npx webpack ${argsString} ${suitArg} ${extraArgs}`, {verbosity: 3})
			.exec()
			.on('error', console.error);
	});

	gulp.task('test:component:run', async () => {
		const
			process = require('process'),
			arg = require('arg');

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
			'--client-name': String

		}, {permissive: true});

		if (!args['--name']) {
			throw new ReferenceError('"--name" parameter is not specified');
		}

		args['--client-name'] = args['--client-name'] || args['--name'];

		let
			browsers = getSelectedBrowsers(),
			exitCode = 0,
			headless = true,
			closeOnFinish = true;

		if (args['--headless']) {
			headless = JSON.parse(args['--headless']);
		}

		if (args['--close']) {
			closeOnFinish = JSON.parse(args['--close']);
		}

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

		const test = require(path.join(componentDir, 'test'));

		const browserParams = {
			chromium: {},
			firefox: {},
			webkit: {}
		};

		const createBrowser = async (browserType) => {
			const
				browser = await getBrowserInstance(browserType, {headless}),
				context = await browser.newContext(),
				page = await context.newPage();

			browserParams[browserType] = {page, browser, context, browserType, componentDir, tmpDir};
		}

		const runTest = async (browserType) => {
			const
				params = browserParams[browserType],
				{page} = params;

			await page.goto(`localhost:${args['--port']}/${args['--page']}.html`);
			const testEnv = getTestEnv(browserType);
			await test(page, params);

			const close = () => {
				closeOnFinish && params.browser.close();
				process.exitCode = exitCode;
			};

			testEnv.addReporter({
				specDone: (res) => {
					if (exitCode === 1) {
						return;
					}

					exitCode = res.status === 'failed' ? 1 : 0
				}
			});

			await new Promise((resolve) => {
				testEnv.afterAll(() => resolve(), 10e3);
				testEnv.execute();
			}).then(close, close);
		}

		const browsersPromises = [];

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

	gulp.task('test:component',
		gulp.series(['test:component:build', 'test:component:run'])
	);

	gulp.task('test:components', async (cb) => {
		console.log(`CPUS available: ${cpus}`);

		const
			arg = require('arg'),
			playwright = require('playwright');

		const
			cwd = resolve.cwd,
			cases = require(path.join(cwd, 'tests/cases.js'));

		const processesArgs = arg({
			'--processes': Number,
			'--test-processes': Number,
			'--build-processes': Number

		}, {permissive: true});

		const wsEndpoints = {
			chromium: '',
			firefox: '',
			webkit: ''
		};

		const
			servers = {},
			browsers = getSelectedBrowsers();

		const
			buildProcess = processesArgs['--build-processes'] || processesArgs['--processes'] || cpus,
			testProcess = processesArgs['--test-processes'] || processesArgs['--processes'] || cpus;

		for (const browserType of browsers) {
			const
				browser = servers[browserType] = await playwright[browserType].launchServer(),
				wsEndpoint = browser.wsEndpoint();

			wsEndpoints[browserType] = wsEndpoint;
		};

		let
			endpointArg = Object.entries(wsEndpoints).map(([key, value]) => `--${key}WsEndpoint ${value}`).join(' ');

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
					failCb(execString, err);
					rej();
				});
		});

		// Build Components
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

			await waitForQuotas(buildMap, buildProcess);

			buildMap.set(
				argsString,
				exec(`npx gulp test:component:build ${argsString}`, () => buildMap.delete(argsString))
			);

			buildCache[args['--client-name']] = true;
		}

		await waitForEmpty(buildMap);

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

			const argsString = `${c} --client-name ${args['--client-name']}`;

			totalCases.push(argsString);
			await waitForQuotas(testMap, testProcess);

			const onTestEnd = (argsString) => testMap.delete(argsString);

			testMap.set(
				argsString,
				exec(`npx gulp test:component:run ${argsString} ${endpointArg}`, 
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
		console.log(`\n✔️ Tests passed: ${totalCases.filter((v) => !failedCases.includes(v)).length}`);
		console.log(`\n❌ Tests failed: ${failedCases.length}`);

		if (failedCases.length) {
			console.log(`\n❗ Failed tests:`);
			console.log(`\n${failedCases.join('\n')}`);
		}

		console.log('\n-------------\n');

		Object.keys(servers).forEach(async (key) => await servers[key].close());

		if (failedCases.length) {
			throw new Error(`Tests didn't passed`);
		}

		cb();
	});
};

/**
 * @param {Function} cb
 * @param {number} interval
 */
function wait(cb, interval = 15) {
	return new Promise((res) => {
		if (Boolean(cb())) {
			res();
			return;
		}
	
		const intervalId = setInterval(() => {
			if (Boolean(cb())) {
				res();
				clearInterval(intervalId);
			}
	
		}, interval);
	});
}

/**
 * Returns a browser instance
 *
 * @param {string} browserType
 * @param {!Object} params
 */
async function getBrowserInstance(browserType, params) {
	const
		arg = require('arg'),
		playwright = require('playwright');

	const args = arg({
		'--firefoxWsEndpoint': String,
		'--webkitWsEndpoint': String,
		'--chromiumWsEndpoint': String
	}, {permissive: true});

	const endpointMap = {
		firefox: '--firefoxWsEndpoint',
		webkit: '--webkitWsEndpoint',
		chromium: '--chromiumWsEndpoint'
	};

	if (args[endpointMap[browserType]]) {
		return await playwright[browserType].connect({wsEndpoint: args[endpointMap[browserType]], ...params});
	}

	return await playwright[browserType].launch(params);
}

/**
 * Returns selected browsers
 */
function getSelectedBrowsers() {
	const
		args = require('arg')({'--browsers': String}, {permissive: true}),
		browsers = ['chromium', 'firefox', 'webkit'];

	const aliases = {
		ff: 'firefox',
		chr: 'chromium',
		chrome: 'chromium',
		chromium: 'chromium',
		wk: 'webkit'
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
