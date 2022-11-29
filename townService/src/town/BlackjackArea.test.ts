import { mock, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import DealerPlayer from '../games/blackjack/players/DealerPlayer';
import GameStatus from '../games/blackjack/players/GameStatus';
import HumanPlayer from '../games/blackjack/players/HumanPlayer';
import Suit from '../games/cards/Suit';
import Value from '../games/cards/Value';
import CardFactory from '../games/cards/CardFactory';
import Player from '../lib/Player';
import { getLastEmittedEvent } from '../TestUtils';
import { BlackjackPlayer, TownEmitter } from '../types/CoveyTownSocket';
import BlackjackArea from './BlackjackArea';
import Hand from '../games/blackjack/players/Hand';

describe('BlackjackArea', () => {
  const testAreaBox = { x: 100, y: 100, width: 100, height: 100 };
  let testArea: BlackjackArea;
  const townEmitter = mock<TownEmitter>();
  let newPlayer: Player;
  const id = nanoid();
  const dealer = { id: '0', hand: [], gameStatus: 'Waiting' };
  const players: BlackjackPlayer[] = [];
  const update = undefined;
  const bettingAmount = 0;

  beforeEach(() => {
    mockClear(townEmitter);
    testArea = new BlackjackArea(
      { id, dealer, players, update, bettingAmount },
      testAreaBox,
      townEmitter,
    );
    newPlayer = new Player(nanoid(), mock<TownEmitter>());
    testArea.add(newPlayer);
    testArea.disableTimeouts();
  });

  describe('remove', () => {
    it('Removes the player from the list of occupants and emits an interactableUpdate event', () => {
      // Add another player so that we are not also testing what happens when the last player leaves
      const extraPlayer = new Player(nanoid(), mock<TownEmitter>());
      testArea.add(extraPlayer);
      testArea.remove(newPlayer);

      expect(testArea.occupantsByID).toEqual([extraPlayer.id]);
      const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
      expect(lastEmittedUpdate).toEqual({ id, dealer, players, update, bettingAmount });
    });
    it("Clears the player's conversationLabel and emits an update for their location", () => {
      testArea.remove(newPlayer);
      expect(newPlayer.location.interactableID).toBeUndefined();
      const lastEmittedMovement = getLastEmittedEvent(townEmitter, 'playerMoved');
      expect(lastEmittedMovement.location.interactableID).toBeUndefined();
    });
  });
  describe('add', () => {
    it('Adds the player to the occupants list', () => {
      expect(testArea.occupantsByID).toEqual([newPlayer.id]);
    });
    it("Sets the player's conversationLabel and emits an update for their location", () => {
      expect(newPlayer.location.interactableID).toEqual(id);

      const lastEmittedMovement = getLastEmittedEvent(townEmitter, 'playerMoved');
      expect(lastEmittedMovement.location.interactableID).toEqual(id);
    });
  });
  test('toModel sets the ID, dealer, players, update, and bettingAmount', () => {
    const model = testArea.toModel();
    expect(model).toEqual({
      id,
      dealer,
      players,
      update,
      bettingAmount,
    });
  });
  describe('updateModel', () => {
    it('updateModel sets dealer, players, update, and bettingAmount', () => {
      testArea.updateModel({
        id: 'ignore',
        dealer: {
          id: 'dealer2',
          hand: [{ value: 'A', suit: 'Clubs', faceUp: true }],
          gameStatus: 'Playing',
        },
        players: [
          {
            id: 'player1',
            hand: [{ value: 'K', suit: 'Spades', faceUp: true }],
            gameStatus: 'Playing',
          },
        ],
        update: undefined,
        bettingAmount: 50,
      });
      expect(testArea.id).toBe(id);
      expect(testArea.dealer).toEqual({
        id: 'dealer2',
        hand: [{ value: 'A', suit: 'Clubs', faceUp: true }],
        gameStatus: 'Playing',
      });
      expect(testArea.players).toEqual([
        {
          id: 'player1',
          hand: [{ value: 'K', suit: 'Spades', faceUp: true }],
          gameStatus: 'Playing',
        },
      ]);
      expect(testArea.update).toBe(undefined);
      // expect(testArea.bettingAmount).toBe(50);
    });
    it('Sending a Start update a game adds cards to the players and dealer if both Waiting', () => {
      testArea.updateModel({
        id: 'ignore',
        dealer: {
          id: '0',
          hand: [],
          gameStatus: 'Waiting',
        },
        players: [
          {
            id: 'player1',
            hand: [],
            gameStatus: 'Waiting',
          },
        ],
        update: { id: 'player1', action: 'Start', timestamp: '0' },
        bettingAmount,
      });
      expect(testArea.dealer.hand.length).toBe(2);
      expect(testArea.players[0].hand.length).toBe(2);
      expect(testArea.dealer.gameStatus).toBe('Playing');
      expect(testArea.players[0].gameStatus).toBe('Playing');
      expect(testArea.update).toEqual({ id: 'player1', action: 'Start', timestamp: '0' });
      // expect(testArea.bettingAmount).toBe(0);
    });
    it('Sending a Start update doesnt add anything if players and dealer arent Waiting', () => {
      testArea.updateModel({
        id: 'ignore',
        dealer: {
          id: '0',
          hand: [],
          gameStatus: 'Playing',
        },
        players: [
          {
            id: 'player1',
            hand: [],
            gameStatus: 'Playing',
          },
        ],
        update: { id: 'player1', action: 'Start', timestamp: '0' },
        bettingAmount,
      });
      expect(testArea.dealer.hand.length).toBe(0);
      expect(testArea.players[0].hand.length).toBe(0);
      expect(testArea.dealer.gameStatus).toBe('Playing');
      expect(testArea.players[0].gameStatus).toBe('Playing');
      expect(testArea.update).toEqual({ id: 'player1', action: 'Start', timestamp: '0' });
    });
    it('Sending a Hit update doesnt add anything if players arent Playing', () => {
      testArea.updateModel({
        id: 'ignore',
        dealer: {
          id: '0',
          hand: [],
          gameStatus: 'Waiting',
        },
        players: [
          {
            id: 'player1',
            hand: [],
            gameStatus: 'Waiting',
          },
        ],
        update: { id: 'player1', action: 'Hit', timestamp: '0' },
        bettingAmount,
      });
      expect(testArea.dealer.hand.length).toBe(0);
      expect(testArea.players[0].hand.length).toBe(0);
      expect(testArea.dealer.gameStatus).toBe('Waiting');
      expect(testArea.players[0].gameStatus).toBe('Waiting');
      expect(testArea.update).toEqual({ id: 'player1', action: 'Hit', timestamp: '0' });
    });
    it('Sending a Hit adds a card if players are Playing and a game has started', () => {
      testArea.updateModel({
        id: 'ignore',
        dealer: {
          id: '0',
          hand: [],
          gameStatus: 'Waiting',
        },
        players: [
          {
            id: 'player1',
            hand: [],
            gameStatus: 'Waiting',
          },
        ],
        update: { id: 'player1', action: 'Start', timestamp: '0' },
        bettingAmount,
      });
      const newPlayers = testArea.players;
      const newDealer = testArea.dealer;
      testArea.updateModel({
        id: 'ignore',
        dealer: newDealer,
        players: newPlayers,
        update: { id: 'player1', action: 'Hit', timestamp: '1' },
        bettingAmount,
      });
      // checks if player gets blackjack immediately
      if (newPlayers[0].gameStatus !== 'Won') {
        expect(testArea.players[0].hand.length).toBe(3);
      } else {
        expect(testArea.players[0].hand.length).toBe(2);
      }
      expect(testArea.update).toEqual({ id: 'player1', action: 'Hit', timestamp: '1' });
    });
    it('Sending a Stay does nothing if players are Waiting and a game hasnt started', () => {
      testArea.updateModel({
        id: 'ignore',
        dealer: {
          id: '0',
          hand: [],
          gameStatus: 'Waiting',
        },
        players: [
          {
            id: 'player1',
            hand: [],
            gameStatus: 'Waiting',
          },
        ],
        update: { id: 'player1', action: 'Stay', timestamp: '0' },
        bettingAmount,
      });
      expect(testArea.dealer.hand.length).toBe(0);
      expect(testArea.players[0].hand.length).toBe(0);
      expect(testArea.dealer.gameStatus).toBe('Waiting');
      expect(testArea.players[0].gameStatus).toBe('Waiting');
      expect(testArea.update).toEqual({ id: 'player1', action: 'Stay', timestamp: '0' });
    });
    it('Sending a Stay finishes the game if players are Playing and a game has started', () => {
      testArea.updateModel({
        id: 'ignore',
        dealer: {
          id: '0',
          hand: [],
          gameStatus: 'Waiting',
        },
        players: [
          {
            id: 'player1',
            hand: [],
            gameStatus: 'Waiting',
          },
        ],
        update: { id: 'player1', action: 'Start', timestamp: '0' },
        bettingAmount,
      });
      const newPlayers = testArea.players;
      const newDealer = testArea.dealer;
      testArea.updateModel({
        id: 'ignore',
        dealer: newDealer,
        players: newPlayers,
        update: { id: 'player1', action: 'Stay', timestamp: '1' },
        bettingAmount,
      });
      expect(['Lost', 'Won']).toContain(testArea.players[0].gameStatus);
      expect(['Lost', 'Won']).toContain(testArea.dealer.gameStatus);
      expect(testArea.update).toEqual({ id: 'player1', action: 'Stay', timestamp: '1' });
    });
    it('Sending an update from an unknown player doesnt do anything', () => {
      testArea.updateModel({
        id: 'ignore',
        dealer: {
          id: '0',
          hand: [],
          gameStatus: 'Waiting',
        },
        players: [
          {
            id: 'player1',
            hand: [],
            gameStatus: 'Waiting',
          },
        ],
        update: { id: 'unknownPlayer', action: 'Start', timestamp: '0' },
        bettingAmount,
      });
      expect(testArea.dealer.hand.length).toBe(0);
      expect(testArea.players[0].hand.length).toBe(0);
      expect(testArea.dealer.gameStatus).toBe('Waiting');
      expect(testArea.players[0].gameStatus).toBe('Waiting');
      expect(testArea.update).toEqual({ id: 'unknownPlayer', action: 'Start', timestamp: '0' });
      const newPlayers = testArea.players;
      const newDealer = testArea.dealer;
      testArea.updateModel({
        id: 'ignore',
        dealer: newDealer,
        players: newPlayers,
        update: { id: 'unknownPlayer', action: 'Stay', timestamp: '1' },
        bettingAmount,
      });
      expect(testArea.dealer.hand.length).toBe(0);
      expect(testArea.players[0].hand.length).toBe(0);
      expect(testArea.dealer.gameStatus).toBe('Waiting');
      expect(testArea.players[0].gameStatus).toBe('Waiting');
      expect(testArea.update).toEqual({ id: 'unknownPlayer', action: 'Stay', timestamp: '1' });
    });
  });
  describe('fromMapObject', () => {
    it('Throws an error if the width or height are missing', () => {
      expect(() =>
        BlackjackArea.fromMapObject(
          { id: 1, name: nanoid(), visible: true, x: 0, y: 0 },
          townEmitter,
        ),
      ).toThrowError();
    });
    it('Creates a new blackjack area using the provided boundingBox and id, with a default dealer, empty players, and betting amount of 0, and emitter', () => {
      const x = 30;
      const y = 20;
      const width = 10;
      const height = 20;
      const name = 'name';
      const val = BlackjackArea.fromMapObject(
        { x, y, width, height, name, id: 10, visible: true },
        townEmitter,
      );
      expect(val.boundingBox).toEqual({ x, y, width, height });
      expect(val.id).toEqual(name);
      expect(val.dealer).toEqual({ id: '0', hand: [], gameStatus: 'Waiting' });
      expect(val.update).toBeUndefined();
      // expect(val.bettingAmount).toEqual(0);
      expect(val.occupantsByID).toEqual([]);
    });
  });
  describe('updateFromBlackjack', () => {
    it('Updates the dealer and players based off of DealerPlayer and HumanPlayer[] input', () => {
      const dealerPlayer = new DealerPlayer(GameStatus.Waiting, 'dealerID');
      const humanPlayers = [new HumanPlayer(GameStatus.Waiting, 'playerID')];
      dealerPlayer.addCard(CardFactory.getCard(Value.Ace, Suit.Clubs));
      dealerPlayer.addCard(CardFactory.getCard(Value.Three, Suit.Spades));
      humanPlayers[0].addCard(CardFactory.getCard(Value.Five, Suit.Diamonds));
      humanPlayers[0].addCard(CardFactory.getCard(Value.Jack, Suit.Hearts));
      testArea.updateFromBlackjack(dealerPlayer, humanPlayers);
      expect(testArea.dealer.gameStatus).toBe('Waiting');
      expect(testArea.players[0].gameStatus).toBe('Waiting');
      expect(testArea.dealer.id).toBe('dealerID');
      expect(testArea.players[0].id).toBe('playerID');
      expect(testArea.dealer.hand).toContainEqual({ value: 'A', suit: 'Clubs', faceUp: false });
      expect(testArea.dealer.hand).toContainEqual({ value: '3', suit: 'Spades', faceUp: true });
      expect(testArea.players[0].hand).toContainEqual({
        value: '5',
        suit: 'Diamonds',
        faceUp: true,
      });
      expect(testArea.players[0].hand).toContainEqual({ value: 'J', suit: 'Hearts', faceUp: true });

      const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
      expect(lastEmittedUpdate).toEqual({
        id,
        dealer: {
          id: 'dealerID',
          hand: [
            { value: 'A', suit: 'Clubs', faceUp: false },
            { value: '3', suit: 'Spades', faceUp: true },
          ],
          gameStatus: 'Waiting',
        },
        players: [
          {
            id: 'playerID',
            hand: [
              { value: '5', suit: 'Diamonds', faceUp: true },
              { value: 'J', suit: 'Hearts', faceUp: true },
            ],
            gameStatus: 'Waiting',
          },
        ],
        update,
        bettingAmount,
      });
    });
  });
  describe('endGame', () => {
    it('Resets the players and dealers hands and game statuses', () => {
      testArea.updateModel({
        id: 'ignore',
        dealer: {
          id: '0',
          hand: [{ value: 'A', suit: 'Clubs', faceUp: true }],
          gameStatus: 'Playing',
        },
        players: [
          {
            id: 'player1',
            hand: [{ value: '5', suit: 'Diamonds', faceUp: true }],
            gameStatus: 'Playing',
          },
        ],
        update,
        bettingAmount,
      });
      expect(testArea.dealer.gameStatus).toBe('Playing');
      expect(testArea.players[0].gameStatus).toBe('Playing');
      expect(testArea.dealer.hand.length).toBe(1);
      expect(testArea.players[0].hand.length).toBe(1);
      testArea.endGame();
      expect(testArea.dealer.gameStatus).toBe('Waiting');
      expect(testArea.players[0].gameStatus).toBe('Waiting');
      expect(testArea.dealer.hand.length).toBe(0);
      expect(testArea.players[0].hand.length).toBe(0);

      const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
      expect(lastEmittedUpdate).toEqual({
        id,
        dealer: {
          id: '0',
          hand: [],
          gameStatus: 'Waiting',
        },
        players: [
          {
            id: 'player1',
            hand: [],
            gameStatus: 'Waiting',
          },
        ],
        update,
        bettingAmount,
      });
    });
  });
  describe('handToListOfPlayingCards', () => {
    it('Converts a hand to a list of playing cards', () => {
      const hand = new Hand([
        [CardFactory.getCard(Value.Seven, Suit.Hearts), false],
        [CardFactory.getCard(Value.Eight, Suit.Diamonds), true],
      ]);
      const cards = BlackjackArea.handToListOfPlayingCards(hand);
      expect(cards).toEqual([
        { value: '7', suit: 'Hearts', faceUp: false },
        { value: '8', suit: 'Diamonds', faceUp: true },
      ]);
    });
  });
  describe('suitToString', () => {
    it('Converts suit to string form', () => {
      expect(BlackjackArea.suitToString(Suit.Clubs)).toBe('Clubs');
      expect(BlackjackArea.suitToString(Suit.Hearts)).toBe('Hearts');
      expect(BlackjackArea.suitToString(Suit.Diamonds)).toBe('Diamonds');
      expect(BlackjackArea.suitToString(Suit.Spades)).toBe('Spades');
    });
  });
  describe('valueToString', () => {
    it('Converts value to string form', () => {
      expect(BlackjackArea.valueToString(Value.Ace)).toBe('A');
      expect(BlackjackArea.valueToString(Value.King)).toBe('K');
      expect(BlackjackArea.valueToString(Value.Queen)).toBe('Q');
      expect(BlackjackArea.valueToString(Value.Jack)).toBe('J');
      expect(BlackjackArea.valueToString(Value.Seven)).toBe('7');
      expect(BlackjackArea.valueToString(Value.Two)).toBe('2');
    });
  });
  describe('playersToBlackjackPlayers', () => {
    it('Converts a list of HumanPlayers to BlackjackPlayers', () => {
      const humanPlayers = [
        new HumanPlayer(GameStatus.Waiting, 'player1'),
        new HumanPlayer(GameStatus.Won, 'player2'),
      ];
      humanPlayers[0].addCard(CardFactory.getCard(Value.Seven, Suit.Hearts));
      humanPlayers[0].addCard(CardFactory.getCard(Value.Eight, Suit.Diamonds));
      const newPlayers = BlackjackArea.playersToBlackjackPlayers(humanPlayers);
      expect(newPlayers[0].hand).toContainEqual({ value: '7', suit: 'Hearts', faceUp: true });
      expect(newPlayers[0].hand).toContainEqual({ value: '8', suit: 'Diamonds', faceUp: true });
      expect(newPlayers[1].hand.length).toBe(0);
      expect(newPlayers[0].gameStatus).toBe('Waiting');
      expect(newPlayers[1].gameStatus).toBe('Won');
      expect(newPlayers[0].id).toBe('player1');
      expect(newPlayers[1].id).toBe('player2');
    });
  });
});
