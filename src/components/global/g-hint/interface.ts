/* eslint-disable capitalized-comments */

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * Hint positions to show
 */
export type HintPosition =
	//     v
	// A hint message
	'top' |

	// v
	// A hint message
	'top-left' |

	//            v
	// A hint message
	'top-right' |

	//   A hint message
	// > ...
	//   ...
	'left' |

	// > A hint message
	//   ...
	//   ...
	'left-top' |

	//   A hint message
	//   ...
	// > ...
	'left-bottom' |

	// A hint message
	// ...          <
	// ...
	'right' |

	// A hint message <
	// ...
	// ...
	'right-top' |

	// A hint message
	// ...
	// ...          <
	'right-bottom' |

	// A hint message
	//     v
	'bottom' |

	// A hint message
	// v
	'bottom-left' |

	// A hint message
	//            v
	'bottom-right';
