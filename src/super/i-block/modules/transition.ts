/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock from 'super/i-block/i-block';
import Block from 'super/i-block/modules/block';

import symbolGenerator from 'core/symbol';
import Async, { AsyncOpts } from 'core/async';

export type StyleValue = string | number;
export type StyleDictionary = Dictionary<StyleValue>;
export type TransitionMode = 'sequence' | 'parallel';

export const nonAnimatedProperties = {
	transition: true,
	display: true,
	pointerEvents: true
};

export const
	$$ = symbolGenerator();

export const
	CONTROLLER_GROUP = '[[TRANSITION_CONTROLLER]]',
	TRANSITION_GROUP = '[[TRANSITION]]';

export enum TRANSITION_STATES {
	initial = 0,
	run = 1,
	end = 2
}

export interface TransitionCtx {
	ctx: iBlock;
	label: Label;
	transition: Transition;
}

export interface TransitionInfo {
	state: TRANSITION_STATES;
	props: StyleDictionary;
	node: HTMLElement;
	promise: Promise<Transition>;
	duration?: number;
	delay?: number;
}

export interface TransitionParams {
	node: HTMLElement;
	props: StyleDictionary;
	duration?: number;
	delay?: number;
}

export type TransitionDirection = 'forward' | 'revers';
export type Target = HTMLElement | string;
export type NonAnimatedProperties = typeof nonAnimatedProperties;

/**
 * @see https://github.com/microsoft/TypeScript/issues/1863
 */
export type Label = any;

export interface Controller {
	sequence(label: Label): Transition;
	parallel(label: Label): Transition;
	reverse(label: Label): CanUndef<Transition>;

	stop(label: Label): void;
	stopAll(): void;

	kill(label: Label): void;
	killAll(): void;
}

export class Transition {
	/**
	 * Transition label
	 */
	protected label: Label;

	/**
	 * Link to component
	 */
	protected component: iBlock;

	/**
	 * Transition mode
	 */
	protected mode: TransitionMode;

	/**
	 * Transition direction
	 */
	protected direction: TransitionDirection;

	/**
	 * Stack of transitions
	 */
	protected stack: TransitionInfo[] = [];

	/**
	 * List of subscribers
	 */
	protected subscribers: Function[] = [];

	/**
	 * State of transition
	 */
	protected state: TRANSITION_STATES;

	/**
	 * Link to current transition
	 */
	protected current: CanUndef<TransitionInfo>;

	/**
	 * Link to component async module
	 */
	protected get async(): Async {
		// @ts-ignore
		return this.component.async;
	}

	/**
	 * Link to component block module
	 */
	protected get block(): Block {
		// @ts-ignore
		return this.component.block;
	}

	/**
	 * True, if transition finished
	 */
	get isFinished(): boolean {
		return this.stack.every((info) => info.state === TRANSITION_STATES.end);
	}

	/**
	 * Property for visible elements
	 */
	get visibleProps(): StyleDictionary {
		return {
			visibility: 'visible',
			pointerEvents: 'auto'
		};
	}

	/**
	 * Property for hidden elements
	 */
	get hiddenProps(): StyleDictionary {
		return {
			visibility: 'hidden',
			pointerEvents: 'none'
		};
	}

	/**
	 * @param ctx
	 * @param label
	 * @param mode
	 */
	constructor(component: iBlock, label: Label, mode: TransitionMode) {
		this.state = TRANSITION_STATES.initial;
		this.component = component;
		this.direction = 'forward';
		this.label = label;
		this.mode = mode;

	}

	/**
	 * Runs a transition
	 *
	 * @param el
	 * @param props
	 * @param duration - transition time in seconds
	 * @param [delay] - delay before transition start in seconds
	 */
	run(el: Target, props: StyleDictionary, duration: number, delay?: number): Transition {
		return this;
	}

	/**
	 * Makes element visible
	 */
	visible(el: Target, props?: StyleDictionary): Transition {
		props = {
			...this.visibleProps,
			...props
		};

		const
			{async: $a} = this,
			node = this.getNode(el);

		if (!node) {
			return this;
		}

		const resolver = (resolve, reject) => {
			Object.assign(node.style, props);

			$a.requestAnimationFrame(() => {
				resolve(this);

			}, {group: TRANSITION_GROUP});
		};

		this.append({node, props}, resolver);
		return this;
	}

	/**
	 * Makes element hidden
	 */
	hidden(el: Target, props?: StyleDictionary): Transition {
		return this;
	}

	/**
	 * Revers a transition
	 */
	reverse(): Transition {
		return this;
	}

	/**
	 * Kills a transition
	 */
	kill(): void {
		//..
	}

	/**
	 * True, if transition is complete
	 */
	isFulfilled(): boolean {
		return this.state === TRANSITION_STATES.end;
	}

	/**
	 * @param resolve
	 * @param reject
	 */
	then(resolve: Function): Transition {
		if (this.isFinished) {
			Promise.resolve().then(() => resolve(this));
			return this;
		}

		// Возможно стоит биндить каждый then к определенной transition

		this.subscribers.push(resolve);
		return this;
	}

	/**
	 * Creates a transition info object
	 *
	 * @param node
	 * @param [props]
	 * @param [duration]
	 * @param [delay]
	 */
	protected createInfo(
		params: TransitionParams,
		executor: (resolve: Function, reject: Function) => unknown
	): TransitionInfo {
		const
			$a = this.async;

		return {
			...params,
			state: TRANSITION_STATES.initial,
			promise: $a.promise(new Promise<Transition>(executor))
		};
	}

	/**
	 * Appends transition into stack
	 * @param info
	 */
	protected append(info: TransitionParams, executor: (resolve: Function, reject: Function) => unknown): TransitionInfo {
		if (!this.stack.length) {
			this.state = TRANSITION_STATES.run;
		}

		const transition = this.createInfo(info, executor);
		this.stack.push(transition);

		return transition;
	}

	/**
	 * Returns a DOM node by selector
	 */
	protected getNode(node: HTMLElement | string): CanUndef<HTMLElement> {
		return node instanceof HTMLElement ? node : this.block.element(node);
	}

	/**
	 * ..
	 */
	protected next(): CanUndef<TransitionInfo> {
		const {stack} = this;

		for (let i = 0; i < stack.length; i++) {
			if (stack[i].state === TRANSITION_STATES.initial) {
				return stack[i];
			}
		}
	}
}

export class TransitionController {
	/**
	 * Stores a transition links
	 */
	protected store: Dictionary<TransitionCtx> = {};

	/**
	 * Creates a new parallel transition timeline
	 */
	parallel(ctx: iBlock, label: Label): Transition {
		this.kill(label);

		const
			{store} = this,
			transitionCtx = store[label] = this.buildContext(ctx, label, 'parallel');

		return transitionCtx.transition;
	}

	/**
	 * Creates a new transition sequence
	 * @param ctx
	 * @param label
	 */
	sequence(ctx: iBlock, label: Label): Transition {
		this.kill(label);

		const
			{store} = this,
			transitionCtx = store[label] = this.buildContext(ctx, label, 'sequence');

		return transitionCtx.transition;
	}

	/**
	 * Reverse a transition
	 *
	 * @param ctx
	 * @param label
	 */
	reverse(label: Label): CanUndef<Transition> {
		const
			transition = this.getTransition(label);

		if (transition) {
			return transition;
		}
	}

	/**
	 * Stops a transition
	 * @param label
	 */
	stop(label: Label): void {
		//..
	}

	/**
	 * Stops all transitions
	 */
	stopAll(): void {
		//..
	}

	/**
	 * Removes a transition
	 * @param label
	 */
	kill(label: Label): void {
		const
			transition = this.getTransition(label);

		if (transition) {
			transition.kill();
			delete this.store[label];
		}
	}

	/**
	 * Removes all transitions
	 */
	killAll(): void {
		//..
	}

	/**
	 * Returns a transition
	 * @param transition
	 */
	protected getTransition(label: Label): CanUndef<Transition> {
		const
			quota = this.store[label];

		if (quota) {
			return quota.transition;
		}
	}

	/**
	 * Returns a transition context
	 * @param label
	 */
	protected getTransitionCtx(label: Label): CanUndef<TransitionCtx> {
		return this.store[label];
	}

	/**
	 * Returns link to component async module
	 * @param ctx
	 */
	protected getAsync(ctx: iBlock): Async {
		// @ts-ignore
		return ctx.async;
	}

	/**
	 * Builds a new transition context
	 *
	 * @param ctx
	 * @param label
	 */
	protected buildContext(ctx: iBlock, label: Label, mode: TransitionMode): TransitionCtx {
		const
			$a = this.getAsync(ctx),
			group = {group: CONTROLLER_GROUP};

		$a.worker(() => {
			// should kill transition?
			delete this.store[label];
		}, group);

		return {
			ctx,
			label,
			transition: new Transition(ctx, label, mode)
		};
	}
}

const Controller = new TransitionController();
export default Controller;
