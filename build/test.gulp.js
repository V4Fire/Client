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
	fs = require('fs'),
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
			'--headless': String,
			'--saveEndpoint': String
		}, {permissive: true});

		if (!args['--name']) {
			throw new ReferenceError('"--name" parameter is not specified');
		}

		let
			browsers = ['chromium', 'firefox', 'webkit'];

		let
			saveEndpoint = false,
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

		if (args['--saveEndpoint']) {
			saveEndpoint = JSON.parse(args['--saveEndpoint']);
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
				browserProto = playwright[browserType];

			let
				server,
				savedWsEndpoint = getEndpoint(browserType),
				wsEndpoint = savedWsEndpoint;

			if (!savedWsEndpoint && saveEndpoint) {
				server = await browserProto.launchServer({headless}),
				wsEndpoint = server.wsEndpoint();
			}

			const
				browser = saveEndpoint ? await browserProto.connect({wsEndpoint}) : await browserProto.launch({headless}),
				context = await browser.newContext(),
				page = await context.newPage();

			if (!savedWsEndpoint) {
				writeEndpoint(browserType, wsEndpoint);
			}

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

		clearEndpointTemp();

		const run = (c) => new Promise((res) => {
			$.run(`npx gulp test:component --saveEndpoint true ${c}`, {verbosity: 3})
				.exec('', res)
				.on('error', console.error);
		})

		const promises = [];

		for (let i = 0; i < cases.length; i++) {
			promises.push(run(cases[i]));
		}

		await Promise.all(promises);
		cb();

		// Выключать сервера браузеров
	});
};

/**
 * Returns a browser connection endpoint
 *
 * @param {string} browserType
 * @returns {string}
 */
function getEndpoint(browserType) {
	const
		temp = path.join(resolve.cwd, 'tests/temp');

	try {
		return fs.readFileSync(path.join(temp, `endpoint-${browserType}`), {encoding: 'utf-8'});

	} catch (e) {
		if (e.code !== 'ENOENT') throw e;
		return null;
	}

}

/**
 * Saves the specified end point to the temporary file
 *
 * @param {string} browserType 
 * @param {string} endpoint
 */
function writeEndpoint(browserType, endpoint) {
	const
		temp = path.join(resolve.cwd, 'tests/temp/');

	if (!fs.existsSync(temp)){
		fs.mkdirSync(temp);
	}

	fs.writeFileSync(`${temp}/endpoint-${browserType}`, endpoint);
}

/**
 * Clears endpoint temporary files
 * @returns {Promise}
 */
function clearEndpointTemp() {
	const
		$ = require('gulp-load-plugins')({scope: ['optionalDependencies']});

	return new Promise((res) => {
		const
			temp = path.join(resolve.cwd, 'tests/temp');

		$.run(`rm -rf ${temp}`).exec('', res);
	});
}