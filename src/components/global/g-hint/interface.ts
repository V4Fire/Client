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
	// Hint message
	'top' |

	// v
	// Hint message
	'top-left' |

	//            v
	// Hint message
	'top-right' |

	//   Hint message
	// > ...
	//   ...
	'left' |

	// > Hint message
	//   ...
	//   ...
	'left-top' |

	//   Hint message
	//   ...
	// > ...
	'left-bottom' |

	// Hint message
	// ...          <
	// ...
	'right' |

	// Hint message <
	// ...
	// ...
	'right-top' |

	// Hint message
	// ...
	// ...          <
	'right-bottom' |

	// Hint message
	//     v
	'bottom' |

	// Hint message
	// v
	'bottom-left' |

	// Hint message
	//            v
	'bottom-right';
