/* eslint-disable no-promise-executor-return */
/* eslint-disable class-methods-use-this */
import { setTimeout } from 'timers';
import { ReadLine, createInterface } from 'readline';
import Hand from './Hand';
import GameStatus from './GameStatus';
import Player from './Player';
import BlackjackAction from '../blackjack/BlackjackAction';
import Card from '../../cards/Card';

export default class HumanPlayer extends Player {
  private static _rl: ReadLine = createInterface({ input: process.stdin, output: process.stdout });

  private _hand: Hand;

  public get hand(): Hand {
    return this._hand;
  }

  public set hand(value: Hand) {
    this._hand = value;
  }

  public set status(value: GameStatus) {
    super.status = value;
  }

  constructor() {
    super(GameStatus.Waiting);
    this._hand = new Hand();
  }

  public addCard(newCard: Card, newCardHiddenStatus = true): void {
    this._hand.cards.push([newCard, newCardHiddenStatus]);
  }

  public getNumericScore(): Array<number> {
    let scores = this._hand.getNumericScores();
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
    return this.getNumericScore().filter(score => score > 21).length > 0;
  }

  public static parseNextMove(answerText: string): BlackjackAction {
    const answerTextCleaned = answerText.toLowerCase();
    switch (answerTextCleaned) {
      case 'h':
      case 'hit':
      case '1':
        return BlackjackAction.Hit;
        break;
      case 's':
      case 'stay':
      case '0':
        return BlackjackAction.Stay;
        break;
      default:
        return BlackjackAction.Stay;
        break;
    }
  }

  public async getNextMove(): Promise<string> {
    const questionText = 'What would you like to do?\n1. [h]it\n2. [s]tay))';
    // eslint-disable-next-line no-promise-executor-return
    const question = () =>
      new Promise<string>(resolve => HumanPlayer._rl.question(questionText, resolve)).finally(() =>
        HumanPlayer._rl.close(),
      );
    const name = await question();
    return name;
  }

  // I will have to mock this function to test
  public async getBlackjackAction(): Promise<BlackjackAction> {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        resolve(HumanPlayer.parseNextMove(await this.getNextMove()));
      }, 150);
      // I tried to use setTimeout here to simulate async code, but it didnt work
    });
  }

  // This function will be more complicated as we advance
  public async doTurn(): Promise<BlackjackAction> {
    return this.getBlackjackAction();
  }
}
