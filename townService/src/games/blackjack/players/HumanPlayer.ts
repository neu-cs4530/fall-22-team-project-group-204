/* eslint-disable no-promise-executor-return */
/* eslint-disable class-methods-use-this */
import { setTimeout } from 'timers';
import { ReadLine, createInterface } from 'readline';
import { nanoid } from 'nanoid';
import Hand from './Hand';
import GameStatus from './GameStatus';
import BlackjackAction from '../blackjack/BlackjackAction';
import Card from '../../cards/Card';

export default class HumanPlayer {
  private static _rl: ReadLine = createInterface({ input: process.stdin, output: process.stdout });

  private _hand: Hand;

  private _status: GameStatus;

  private _id: string;

  public get hand(): Hand {
    return this._hand;
  }

  public set hand(value: Hand) {
    this._hand = value;
  }

  public get status(): GameStatus {
    return this._status;
  }

  public set status(value: GameStatus) {
    this._status = value;
  }

  public get id(): string {
    return this._id;
  }

  public set id(value: string) {
    this._id = value;
  }

  constructor(status: GameStatus, id: string = nanoid()) {
    this._status = status;
    this._id = id;
    this._hand = new Hand();
  }

  public addCard(newCard: Card, newCardHiddenStatus = true): void {
    this._hand.cards.push([newCard, newCardHiddenStatus]);
  }

  public getNumericScore(): Array<number> {
    let scores = this._hand.getNumericScores();
    if (scores.length > 1) {
      const filteredScores = scores.filter(score => score < 22);
      if (filteredScores.length > 0) {
        scores = filteredScores;
      } else {
        scores = [Math.min(...scores)];
      }
    }
    return scores;
  }

  public has21(): boolean {
    const scores = this.getNumericScore();
    return scores.includes(21);
  }

  public hasBusted(): boolean {
    return this.getNumericScore().filter(score => score < 22).length === 0;
  }

  public static parseNextMove(answerText: string): BlackjackAction {
    const answerTextCleaned = answerText.toLowerCase();
    switch (answerTextCleaned) {
      case 'h':
      case 'hit':
      case '1':
        return BlackjackAction.Hit;
      case 's':
      case 'stay':
      case '0':
      default:
        return BlackjackAction.Stay;
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
    return new Promise(resolve => {
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
