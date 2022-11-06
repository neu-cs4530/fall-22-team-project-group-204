/* eslint-disable class-methods-use-this */
/* eslint-disable prettier/prettier */
import { setTimeout } from "timers";
import Hand from "./Hand";
import { GameStatus } from "./GameStatus";
import Player from "./Player";
import { BlackjackAction } from "../blackjack/BlackjackAction";
import Card from "../../cards/Card";

export default class HumanPlayer extends Player {

  private _hand: Hand;

  public get hand(): Hand {
    return this._hand;
  }

  public set hand(value: Hand) {
    this._hand = value;
  }

	constructor() {
    super(GameStatus.Waiting);
    this._hand = new Hand();
  }

  public addCard(newCard: Card, newCardHiddenStatus = true): void {
    this._hand.cards.push([newCard, newCardHiddenStatus]);
  }

  public getNumericScore(): Array<number> {
    let scores = this._hand.getNumericScore();
    if (scores.length > 1) {
      scores = scores.filter(score => score < 22);
    }
    return scores;
  }

  public has21(): boolean {
    const scores = this.getNumericScore();
    return scores.includes(21);
  }

  public hasBusted(): boolean {
    return this.getNumericScore().filter(score => score > 21).length > 0
  }

  // I will have to mock this function to test
  public async getBlackjackAction(): Promise<BlackjackAction> {
    return new Promise((resolve, reject) => {
      setTimeout(() => { resolve(BlackjackAction.Stay) }, 150);
      // I tried to use setTimeout here to simulate async code, but it didnt work
    })
  }

  // This function will be more complicated as we advance
  public async doTurn(): Promise<BlackjackAction> {
    return this.getBlackjackAction();
  }




}
