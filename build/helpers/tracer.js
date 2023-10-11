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
	 * An instance of the {@link Tracer}
	 */
	trace,

	/**
	 * A counter should be used to generate unique IDs for the events
	 */
	counter: 0,

	/**
	 * Accepts the event name and checks the event queue.
	 * If there is an event with a matching name, the end of the event will be registered.
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
