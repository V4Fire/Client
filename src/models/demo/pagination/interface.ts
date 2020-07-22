/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * Response data
 */
export interface Response {
	data: ResponseItem[];
}

/**
 * Response item
 */
export interface ResponseItem {
	/**
	 * Item index
	 */
	i: number;
}

export interface RequestQuery {
	/**
	 * Request id
	 */
	id: string;

	/**
	 * Number of requested items
	 * @default `12`
	 */
	chunkSize: number;

	/**
	 * Total data that can be loaded
	 */
	total?: number;

	/**
	 * Sleep time before send response
	 * @default `300`
	 */
	sleep?: number;

	/**
	 * Number of requests that should be completed for start generating an error
	 */
	failOn?: number;

	/**
	 * Additional data to be return
	 */
	additionalData?: Dictionary;
}

/**
 * State of a request
 */
export interface RequestState extends RequestQuery {
	/**
	 * Amount of response items that was sent
	 */
	totalSent: number;

	/**
	 * Current index of the response item
	 */
	i: number;

	/**
	 * Current request number
	 */
	requestNumber: number;
}
