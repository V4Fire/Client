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
export type PropertyValue = StyleValue | [StyleValue, number] | [StyleValue, number, number];

export const nonAnimatedProperties = {
	transition: true,
	display: true,
	pointerEvents: true
};

export const
	$$ = symbolGenerator();

export enum TRANSITION_STATES {
	initial = 0,
	run = 1,
	start = 2,
	end = 3
}

export interface Properties extends Dictionary<PropertyValue> {
	duration?: number;
	delay?: number;
}

export interface TransitionOptions {
	timingFn?: string;
	delay?: string;
}

export interface TransitionCtx {
	ctx: iBlock;
	label: Label;
	transition: Transition;
}

export interface TransitionInfo {
	state: TRANSITION_STATES;
	direction: TransitionDirection;
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

export abstract class AbstractTransitionController {
	abstract create(ctx: iBlock, label: Label): Transition;
	abstract reverse(label: Label): CanUndef<Transition>;

	abstract stop(label: Label): void;
	abstract stopAll(): void;

	abstract kill(label: Label): void;
	abstract killAll(): void;
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
	 * Stack of transitions
	 */
	protected stack: TransitionInfo[] = [];

	/**
	 * Current transition (in progress)
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
	 * @param ctx
	 * @param label
	 */
	constructor(component: iBlock, label: Label) {
		this.component = component;
		this.label = label;
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
}

export class TransitionController implements AbstractTransitionController {
	/**
	 * Stores a transition links
	 */
	protected store: Dictionary<TransitionCtx> = {};

	/**
	 * Creates a new transition timeline
	 */
	create(ctx: iBlock, label: Label): Transition {
		if (this.hasTransition(label)) {
			this.kill(label);
		}

		const
			{store} = this,
			transitionCtx = store[label] = this.buildContext(ctx, label);

		return transitionCtx.transition;
	}

	/**
	 * Reverse a transition
	 *
	 * @param ctx
	 * @param label
	 */
	reverse(label: Label): CanUndef<Transition> {
		if (this.hasTransition(label)) {
			return this.getTransition(label);
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
	 * Cancel a transition
	 * @param label
	 */
	kill(label: Label): void {
		//..
	}

	/**
	 * Stops all transitions
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
	 * True, if transition exists
	 * @param label
	 */
	protected hasTransition(label: Label): boolean {
		return Boolean(this.getTransitionCtx(label));
	}

	/**
	 * Builds a new transition context
	 *
	 * @param ctx
	 * @param label
	 */
	protected buildContext(ctx: iBlock, label: Label): TransitionCtx {
		return {
			ctx,
			label,
			transition: new Transition(ctx, label)
		};
	}
}

const Controller = new TransitionController();
export default Controller;
