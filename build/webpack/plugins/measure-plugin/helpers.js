/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const
	{createWriteStream} = require('fs'),
	path = require('upath');

const {tracer} = include('build/helpers/tracer');

/**
 * Writes some trace information to stdout
 * @param {Function} done
 */
exports.writeToStdout = function writeToStdout(done) {
	const
		startTime = tracer.trace.events.at(0)?.ts ?? 0,
		logEvents = tracer.trace.events,
		durations = new Map();

	logEvents.forEach((event) => {
		switch (event.ph) {
			case 'b':
			case 'B':
				durations.set(event.name, event.ts);
				break;

			case 'e':
			case 'E':
				durations.set(event.name, event.ts - durations.get(event.name));
				break;

			case 'I':
				durations.set(event.name, event.ts - startTime);
				break;

			case 'X':
				durations.set(event.name, event.dur);
				break;

			default:
				// Ignore
		}
	});

	console.log('--- Summary ---');
	for (const [name, duration] of durations.entries()) {
		const
			sec = duration / 1e6,
			a = Math.trunc(sec),
			b = Math.round((sec - a) * 100);

		console.log(`${name}: ${a}.${b}s`);
	}

	// Add empty line to prevent console overrides from webpack
	console.log();

	done();
};

/**
 * Writes trace to file
 *
 * @param {Function} done
 * @param {*} param1
 */
exports.writeToFile = function writeToFile(done, {logger, filename}) {
	const ws = createWriteStream(path.resolve(process.cwd(), filename));

	ws.on('error', (error) => {
		logger.error(`Measure write failed, reason: ${error.message}`);
	});

	ws.on('close', done);

	tracer.trace.pipe(ws);
	tracer.trace.flush();
};
