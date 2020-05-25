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
	 */
	chunkSize: number;

	/**
	 * Total data that can be loaded
	 */
	total?: number;

	/**
	 * Sleep time before send response
	 * @default 300
	 */
	sleep?: number;
}

/**
 * State of the request
 */
export interface RequestState extends RequestQuery {
	/**
	 * Amount of response items that was sended
	 */
	totalSended: number;

	/**
	 * Current index of a response item
	 */
	i: number;
}
