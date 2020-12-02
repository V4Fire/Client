/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// @ts-check

const
	{spawn} = require('child_process');

const
	arg = require('arg'),
	path = require('upath'),
	glob = require('glob');

const
	$C = require('collection.js'),
	pzlr = require('@pzlr/build-core');

/**
 * Class provides API to work with launching / configuring / receiving tests
 */
class TestUtils {
	/**
	 * @param {Object=} [options]
	 * @returns {Function}
	 */
	getCurrentTest(options) {
		const
			args = arg({'--runner': String, '--name': String, '--test-entry': String}, {permissive: true}),
			runner = args['--runner'] ?? '**/*';

		options = {
			testDirPath: args['--test-entry'] || `${args['--name']}/test`,
			runnerPath: `${runner}.js`,
			...options
		};

		const
			testDirPath = pzlr.resolve.blockSync(options.testDirPath),
			testPath = path.join(testDirPath, 'runners', options.runnerPath),
			hasMagic = glob.hasMagic(testPath);

		const fns = (hasMagic ? glob.sync(testPath) : [testPath]).map((testPath) => [
			path.relative(`${testDirPath}/runners`, testPath)
				.replace(path.extname(testPath), ''),

			require(testPath)
		]);

		return async (...args) => {
			if (!hasMagic) {
				await fns[0][1](...args);
				return true;
			}

			const
				argv = process.argv.slice(1);

			for (let i = 0; i < argv.length; i++) {
				switch (argv[i]) {
					case '--runner':
						argv.splice(i, 2);
						break;

					case 'test:component':
					case 'test:component:build':
						argv[i] = 'test:component:run';
						break;

					default:
						// Do nothing
				}
			}

			await $C(fns).async.forEach(([runner, fn]) => {
				if (!Object.isFunction(fn)) {
					return;
				}

				const
					child = spawn('node', [...argv, '--runner', runner]);

				child.stdout.pipe(process.stdout);
				child.stderr.pipe(process.stderr);

				return new Promise((close) => child.on('close', close));
			});

			return false;
		};
	}
}

module.exports = new TestUtils();
