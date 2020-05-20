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
			args = arg({'--name': String, '--suit': String}, {permissive: true});

		if (!args['--name']) {
			throw new ReferenceError('"--name" parameter is not specified');
		}

		const
			suitArg = args['--suit'] ? `--suit ${args['--suit']}` : '',
			extraArgs = args._.slice(1).join(' ');

		return $.run(`npx webpack --public-path / --client-output ${args['--name']} --components ${args['--name']} ${suitArg} ${extraArgs}`, {verbosity: 3})
			.exec()
			.on('error', console.error);
	});

	gulp.task('test:component:run', async () => {
		const
			arg = require('arg'),
			playwright = require('playwright');

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
			'--headless': String
		}, {permissive: true});

		if (!args['--name']) {
			throw new ReferenceError('"--name" parameter is not specified');
		}

		let
			browsers = ['chromium', 'firefox', 'webkit'],
			headless = true,
			closeOnFinish = true;

		if (args['--browsers']) {
			const aliases = {
				ff: 'firefox',
				chr: 'chromium',
				chrome: 'chromium',
				chromium: 'chromium',
				wk: 'webkit'
			};

			const customBrowsers = args['--browsers']
				.split(',')
				.map((name) => aliases[name] || null)
				.filter((name) => name);

			if (browsers.length) {
				browsers = customBrowsers;
			}
		}

		if (args['--headless']) {
			headless = JSON.parse(args['--headless']);
		}

		if (args['--close']) {
			closeOnFinish = JSON.parse(args['--close']);
		}

		args['--port'] = args['--port'] || Number.random(2000, 6000);
		args['--page'] = args['--page'] || 'p-v4-components-demo';

		const
			fileServer = new nodeStatic.Server(src.output(args['--name']));

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
				browser = await playwright[browserType].launch({headless}),
				context = await browser.newContext(),
				page = await context.newPage();

			await page.goto(`localhost:${args['--port']}/${args['--page']}.html`);
			const testEnv = getTestEnv(browserType);
			await test(page, {browser, context, browserType, componentDir, tmpDir});

			const
				close = () => closeOnFinish && browser.close();

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
			cwd = resolve.cwd,
			cases = require(path.join(cwd, 'tests/cases.js'));

		let
			successCount = 0,
			failedCount = 0;

		const
			failedCases = [];

		const run = (c) => new Promise((res) => {
			$.run(`npx gulp test:component ${c}`, {verbosity: 3})

				.exec('', () => {
					successCount++;
					res();
				})

				.on('error', (err) => {
					failedCount++;
					failedCases.push(c);
					console.error(err);
				});
		});

		for (let i = 0; i < cases.length; i++) {
			await run(cases[i]);
		}

		console.log(`✔️ Tests passed: ${successCount}`);
		console.log(`❌ Tests failed: ${failedCount}`);

		if (failedCases.length) {
			console.log(`❗ Failed tests: \n${failedCases.join('\n')}`);
		}

		cb();
	});
};
