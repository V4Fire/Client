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

const
	{tracer} = include('build/helpers/tracer'),
	{getLoadersMetrics} = include('build/webpack/loaders/measure-loader');

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
		logger.error(`Trace write failed, reason: ${error.message}`);
	});

	ws.on('close', done);

	tracer.trace.pipe(ws);
	tracer.trace.flush();
};

/**
 * Returns current timestamp in ms
 * @returns {number}
 */
exports.timestamp = () => Number(process.hrtime.bigint() / 1000n);

/**
 * Creates trace events for loaders
 *
 * @param {string} name
 * @param {object} compilationStartEvent
 * @param {object} compilationEndEvent
 */
exports.traceLoaders = function traceLoaders(name, compilationStartEvent, compilationEndEvent) {
	const metrics = getLoadersMetrics(name);

	const
		sums = [...metrics.sums.entries()].sort(([_k1, a], [_k2, b]) => a < b ? 1 : -1),
		compilationTime = compilationEndEvent.ts - compilationStartEvent.ts;

	for (const [loader, value] of sums) {
		const duration = Number(value);

		const loaderEvent = {
			...compilationStartEvent,
			name: loader,
			args: {
				description: [
					'This is a generalizing event.',
					'It summarizes the execution time of individual events.',
					'With webpack module parallelism greater than 1, loader\'s total execution time can be greater than compilation time.'
				].join(' '),
				'percentage of compilation time': (duration / compilationTime * 100).toFixed(3)
			}
		};

		tracer.trace.begin(loaderEvent);
		tracer.trace.end({...loaderEvent, ts: loaderEvent.ts + duration});
	}
};
