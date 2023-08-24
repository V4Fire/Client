/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const {Tracer} = require('chrome-trace-event');

const
	queue = new Map(),
	trace = new Tracer({noStream: true});

exports.tracer = {
	/**
	 * Instance of the {@link Tracer}
	 */
	trace,

	/**
	 * Counter should be used to generate unique IDs for the events
	 */
	counter: 0,

	/**
	 * Accepts event name and checks event queue,
	 * if there is an event with matching name
	 * the event end will be registered.
	 *
	 * @param {string} name
	 * @param {object} [fields]
	 * @returns {() => void}
	 */
	measure(name, fields = {}) {
		const {id = ++this.counter} = fields;
		const end = () => {
			trace.end({...fields, name, id: queue.get(name)});
			queue.delete(name);
		};

		if (queue.has(name)) {
			end();

		} else {
			trace.begin({...fields, name, id});

			queue.set(name, id);
		}

		return end;
	}
};
