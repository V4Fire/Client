'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	path = require('upath'),
	{src} = require('config'),
	{resolve} = require('@pzlr/build-core');

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

		return $.run(`npx webpack --public-path --client-output ${args['--client-name'] || args['--name']} --components ${args['--name']} ${suitArg} ${extraArgs}`, {verbosity: 3})
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

		const
			test = require(path.join(componentDir, 'test'));

		for (const browserType of browsers) {
			const
				browser = await getBrowserInstance(browserType),
				context = await browser.newContext(),
				page = await context.newPage();

			await page.goto(`localhost:${args['--port']}/${args['--page']}.html`);
			const testEnv = getTestEnv(browserType);
			await test(page, {browser, context, browserType, componentDir, tmpDir});

			const
				close = () => closeOnFinish && browser.close() && (process.exitCode = exitCode);

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
		const
			arg = require('arg'),
			playwright = require('playwright');

		const
			cwd = resolve.cwd,
			cases = require(path.join(cwd, 'tests/cases.js'));

		const
			wsEndpoints = {chromium: '', firefox: '', webkit: ''},
			browsers = getSelectedBrowsers(),
			servers = {};

		for (const browserType of browsers) {
			const
				browser = servers[browserType] = await playwright[browserType].launchServer(),
				wsEndpoint = browser.wsEndpoint();

			wsEndpoints[browserType] = wsEndpoint;
		};

		let
			endpointArg = Object.entries(wsEndpoints).map(([key, value]) => `--${key}WsEndpoint ${value}`).join(' ');

		const build = (argsString) => new Promise((res, rej) => {
			$.run(`npx gulp test:component:build ${argsString}`, {verbosity: 3})
				.exec('', res)
				.on('error', (err) => {
					console.log(err);
					rej();
				});
		});

		const
			buildCache = {},
			buildPromises = [];

		for (let i = 0; i < cases.length; i++) {
			const
				c = cases[i],
				args = arg({'--suit': String, '--name': String}, {argv: c.split(' '), permissive: true});

			args['--suit'] = args['--suit'] || 'demo';
			args['--client-name'] = `${args['--name']}_${args['--suit']}`;

			if (buildCache[args['--client-name']]) {
				continue;
			}

			buildPromises.push(build(`--suit ${args['--suit']} --name ${args['--name']} --client-name ${args['--client-name']}`));
			buildCache[args['--client-name']] = true;
		}

		await Promise.all(buildPromises);

		const
			failedCases = [],
			promises = [];

		const run = (c) => new Promise((res, rej) => {
			$.run(`npx gulp test:component:run ${c} ${endpointArg}`, {verbosity: 3})
				.exec('', res)
				.on('error', (err) => {
					failedCases.push(c);
					rej();
				});
		});

		for (let i = 0; i < cases.length; i++) {
			const
				c = cases[i],
				args = arg({'--suit': String, '--name': String}, {argv: c.split(' '), permissive: true});

				args['--suit'] = args['--suit'] || 'demo';
				args['--client-name'] = `${args['--name']}_${args['--suit']}`;

			promises.push(run(`${c} --client-name ${args['--client-name']}`));
		}

		await Promise.all(promises);

		console.log(`\n✔️  Tests passed: ${cases.filter((v) => !failedCases.includes(v)).length}`);
		console.log(`\n❌ Tests failed: ${failedCases.length}`);

		if (failedCases.length) {
			console.log(`\n❗ Failed tests:`);
			console.log('\n-------------');
			console.log(`${failedCases.join('\n')}`);
			console.log('-------------\n');
		}

		Object.keys(servers).forEach(async (key) => await servers[key].close());
		cb();
	});
};


/**
 * Returns a browser instance
 * @param {string} browserType
 */
async function getBrowserInstance(browserType) {
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

	if (args[endpointMap]) {
		return await playwright[browserType].connect({wsEndpoint: args[endpointMap]});
	}

	return await playwright[browserType].launch();
}

/**
 * Returns selected browsers
 */
function getSelectedBrowsers() {
	const
		args = require('arg')({'--browsers': String}, {permissive: true});

	const
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