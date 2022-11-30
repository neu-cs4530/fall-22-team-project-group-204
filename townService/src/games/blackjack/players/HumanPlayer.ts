/* eslint-disable no-promise-executor-return */
/* eslint-disable class-methods-use-this */
import { ReadLine, createInterface } from 'readline';
import { nanoid } from 'nanoid';
import { collection, doc, getDoc, getDocs, orderBy, query, setDoc } from 'firebase/firestore';
import Hand from './Hand';
import GameStatus from './GameStatus';
import BlackjackAction from '../blackjack/BlackjackAction';
import Card from '../../cards/Card';
import db from '../../../database';

import 'firebase/compat/auth';
import 'firebase/compat/database';

export default class HumanPlayer {
  private static _rl: ReadLine = createInterface({ input: process.stdin, output: process.stdout });

  private static _tableName = 'users';

  private _name = 'CoolPlayer';

  private _usersRef;

  private _hand: Hand;

  public get hand(): Hand {
    return this._hand;
  }

  public set hand(value: Hand) {
    this._hand = value;
  }

  private _id: string;

  public get id(): string {
    return this._id;
  }

  private _status: GameStatus;

  public get status(): GameStatus {
    return this._status;
  }

  public set status(value: GameStatus) {
    this._status = value;
  }

  private _lastAction: string | undefined;

  // represents how much currency a user has
  private _wallet: number;

  public get wallet(): number {
    return this._wallet;
  }

  public set wallet(value: number) {
    this._wallet = value;
  }

  private _wins: number;

  public get wins(): number {
    return this._wins;
  }

  public set wins(value: number) {
    this._wins = value;
  }

  public async addWin() {
    this._wins += 1;
    await this.updatePlayerRecord();
  }

  private _losses: number;

  public get losses(): number {
    return this._losses;
  }

  public set losses(value: number) {
    this._losses = value;
  }

  public async addLoss() {
    this._losses += 1;
    await this.updatePlayerRecord();
  }

  private _ties: number;

  public get ties(): number {
    return this._ties;
  }

  public set ties(value: number) {
    this._ties = value;
  }

  public async addTie() {
    this._ties += 1;
    await this.updatePlayerRecord();
  }

  public addCurrency(amount: number) {
    this._wallet += amount;
  }

  private _document() {
    return {
      balance: this._wallet,
      losses: this._losses,
      wins: this._wins,
      ties: this._ties,
      secret_id: this._id,
      name: this._name,
    };
  }

  public static async getAllPlayerRecords() {
    const docRef = collection(db, 'users');
    const orderRef = query(docRef, orderBy('wins', 'desc'), orderBy('balance', 'desc'));
    const docsSnap = await getDocs(orderRef);

    return docsSnap.docs.map(d => d.data());
  }

  public static async getPlayerRecord(id: string) {
    const docRef = doc(db, HumanPlayer._tableName, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error('Player does not exist in database!');
    }

    return docSnap.data();
  }

  public async updatePlayerRecord() {
    const docRef = doc(db, HumanPlayer._tableName, this._id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error('Player does not exist in database!');
    }
    setDoc(docRef, this._document());
  }

  public async addToDatabase() {
    const docRef = doc(db, HumanPlayer._tableName, this._id);
    /* eslint-disable no-console */
    console.log(`PlayerId: ${this._id}`);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) return;
    setDoc(docRef, this._document());
  }

  constructor(status: GameStatus = GameStatus.Waiting, id: string = nanoid(), wallet = 500) {
    this._hand = new Hand();
    this._status = status;
    this._id = id;
    this._lastAction = undefined;
    this._wallet = wallet;
    this._wins = 0;
    this._losses = 0;
    this._ties = 0;
    this._usersRef = collection(db, HumanPlayer._tableName);
  }

  public addCard(newCard: Card, newCardHiddenStatus = true): void {
    this._hand.cards.push([newCard, newCardHiddenStatus]);
  }

  public updateCards(cards: Card[]): void {
    this._hand.cards = cards.map(card => [card, false]);
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

  public getMaxScore(): number {
    const scores = this.getNumericScore().filter(score => score < 22);
    if (scores.length < 1) {
      return -1;
    }
    return Math.max(...scores);
  }

  public has21(): boolean {
    const scores = this.getNumericScore();
    return scores.includes(21);
  }

  public hasBusted(): boolean {
    return this.getNumericScore().filter(score => score < 22).length === 0;
  }

  public static parseNextMove(answerText: string): BlackjackAction {
    const answerTextCleaned = answerText.toLowerCase().trim();
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

  public updateMove(action: string) {
    this._lastAction = action;
  }

  // Somehow, when the last action inputted by the player != undefined (which is updated by the BlackjackArea class),
  // this function should return the _lastAction ('Hit' or 'Stay')
  // It should also reset the value of _lastAction to be undefined
  // This might be achieved somehow through keeping this method, replacing stdin with some other form of Readable, and
  // passing the input in that way
  public getNextMove(): string {
    if (!this._lastAction) {
      throw new Error("Player's last action is undefined");
    }
    return this._lastAction;
  }

  // I will have to mock this function to test
  public getBlackjackAction(): BlackjackAction {
    return HumanPlayer.parseNextMove(this.getNextMove());
  }

  // This function will be more complicated as we advance
  public doTurn(): BlackjackAction {
    return this.getBlackjackAction();
  }
}
