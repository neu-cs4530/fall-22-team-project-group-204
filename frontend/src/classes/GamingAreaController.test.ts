import { mock, mockClear, MockProxy } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { BlackjackArea, BlackjackPlayer } from '../generated/client';
import GamingAreaController, { GamingAreaEvents } from './GamingAreaController';
import TownController from './TownController';

describe('GamingAreaController', () => {
  // A valid ViewingAreaController to be reused within the tests
  let testArea: GamingAreaController;
  let testAreaModel: BlackjackArea;
  const townController: MockProxy<TownController> = mock<TownController>();
  const mockListeners = mock<GamingAreaEvents>();
  beforeEach(() => {
    testAreaModel = {
      id: nanoid(),
      dealer: { id: '0', hand: [], gameStatus: 'Waiting' },
      players: [],
      update: undefined,
      bettingAmount: 0,
      leaderboard: [],
    };
    testArea = new GamingAreaController(testAreaModel);
    mockClear(townController);
    mockClear(mockListeners.dealerChange);
    mockClear(mockListeners.playersChange);
    mockClear(mockListeners.gameStatusChange);
    mockClear(mockListeners.activeGameAlert);
    mockClear(mockListeners.updateChange);
    testArea.addListener('dealerChange', mockListeners.dealerChange);
    testArea.addListener('playersChange', mockListeners.playersChange);
    testArea.addListener('gameStatusChange', mockListeners.gameStatusChange);
    testArea.addListener('activeGameAlert', mockListeners.activeGameAlert);
    testArea.addListener('updateChange', mockListeners.updateChange);
  });
  describe('Setting dealer property', () => {
    it('updates the property and emits a dealerChange event if the property changes', () => {
      const newDealerHand = {
        id: '0',
        hand: [{ value: 'Ace', suit: 'Spades', faceUp: true }],
        gameStatus: 'Waiting',
      };
      testArea.dealer = newDealerHand;
      expect(mockListeners.dealerChange).toBeCalledWith(newDealerHand);
      expect(testArea.dealer).toEqual(newDealerHand);
    });
    it('does not emit a dealerChange event if the dealer property does not change', () => {
      const newDealerHand: BlackjackPlayer = { id: '0', hand: [], gameStatus: 'Waiting' };
      testArea.dealer = newDealerHand;
      expect(mockListeners.dealerChange).not.toBeCalled();
    });
  });
  describe('Setting players property', () => {
    it('updates the model and emits a playersChange event if the property changes', () => {
      const newBlackjackPlayers = [
        {
          id: 'player1',
          hand: [{ value: 'Ace', suit: 'Spades', faceUp: true }],
          gameStatus: 'Waiting',
        },
      ];
      testArea.players = newBlackjackPlayers;
      expect(mockListeners.playersChange).toBeCalledWith(newBlackjackPlayers);
      expect(testArea.players).toEqual(newBlackjackPlayers);
    });
    it('does not emit a playersChange event if the players property does not change', () => {
      const newBlackjackPlayers: BlackjackPlayer[] = [];
      testArea.players = newBlackjackPlayers;
      expect(mockListeners.playersChange).not.toBeCalled();
    });
  });
  describe('Setting update property', () => {
    it('updates the model and emits a updateChange event if the property changes', () => {
      const newValue = { id: '1', action: 'Hit', timestamp: 'N/A' };
      testArea.update = newValue;
      expect(mockListeners.updateChange).toBeCalledWith(newValue);
      expect(testArea.update).toEqual(newValue);
    });
    it('does not emit a updateChange event if the update property does not change', () => {
      const existingValue = testAreaModel.update;
      testArea.update = existingValue;
      expect(mockListeners.updateChange).not.toBeCalled();
    });
  });
  describe('gamingAreaModel', () => {
    it('Carries through all of the properties', () => {
      const model = testArea.gamingAreaModel();
      expect(model).toEqual(testAreaModel);
    });
  });
  describe('updateFrom', () => {
    it('Updates the dealer, players, gameStatus, and update', () => {
      const newModel: BlackjackArea = {
        id: testAreaModel.id,
        dealer: {
          id: '0',
          hand: [{ value: 'Ace', suit: 'Spades', faceUp: true }],
          gameStatus: 'Waiting',
        },
        players: [
          {
            id: 'player1',
            hand: [{ value: 'Ace', suit: 'Spades', faceUp: true }],
            gameStatus: 'Waiting',
          },
        ],
        update: { id: '1', action: 'Hit', timestamp: 'N/A' },
        bettingAmount: 0,
        leaderboard: [],
      };
      testArea.updateFrom(newModel);
      expect(testArea.dealer).toEqual(newModel.dealer);
      expect(testArea.players).toEqual(newModel.players);
      expect(testArea.update).toEqual(newModel.update);
      expect(mockListeners.dealerChange).toBeCalledWith(newModel.dealer);
      expect(mockListeners.playersChange).toBeCalledWith(newModel.players);
      expect(mockListeners.updateChange).toBeCalledWith(newModel.update);
    });
    it('Does not update the id property', () => {
      const existingID = testArea.id;
      const newModel: BlackjackArea = {
        id: nanoid(),
        dealer: {
          id: '0',
          hand: [{ value: 'Ace', suit: 'Spades', faceUp: true }],
          gameStatus: 'Waiting',
        },
        players: [
          {
            id: 'player1',
            hand: [{ value: 'Ace', suit: 'Spades', faceUp: true }],
            gameStatus: 'Waiting',
          },
        ],
        bettingAmount: 0,
        leaderboard: [],
      };
      testArea.updateFrom(newModel);
      expect(testArea.id).toEqual(existingID);
    });
  });
  describe('toggleJoinGame', () => {
    it('Joins a game if a player isnt already in it and game hasnt started', () => {
      expect(testArea.players.length).toBe(0);
      const success = testArea.toggleJoinGame('player1');
      expect(testArea.players.length).toBe(1);
      expect(testArea.players[0].id).toBe('player1');
      expect(testArea.players[0].hand.length).toBe(0);
      expect(testArea.players[0].gameStatus).toBe('Waiting');
      expect(success).toBe(true);

      expect(mockListeners.playersChange).toBeCalledWith(testArea.players);
    });
    it('Doesnt join a game if a player isnt already in it and a game has started', () => {
      testArea.dealer.gameStatus = 'Playing';
      expect(testArea.players.length).toBe(0);
      const success = testArea.toggleJoinGame('player1');
      expect(testArea.players.length).toBe(0);
      expect(success).toBe(false);

      expect(mockListeners.activeGameAlert).toBeCalledWith(true);
    });
    it('Leaves a game if a player is already in it and game hasnt started', () => {
      expect(testArea.players.length).toBe(0);
      testArea.toggleJoinGame('player1');
      expect(testArea.players.length).toBe(1);
      expect(testArea.players[0].id).toBe('player1');
      const success = testArea.toggleJoinGame('player1');
      expect(testArea.players.length).toBe(0);
      expect(success).toBe(true);

      expect(mockListeners.playersChange).toBeCalledWith(testArea.players);
    });
    it('Doesnt leave a game if a player is already in it and game has started', () => {
      expect(testArea.players.length).toBe(0);
      testArea.toggleJoinGame('player1');
      expect(testArea.players.length).toBe(1);
      expect(testArea.players[0].id).toBe('player1');
      testArea.dealer.gameStatus = 'Playing';
      const success = testArea.toggleJoinGame('player1');
      expect(testArea.players.length).toBe(1);
      expect(testArea.players[0].id).toBe('player1');
      expect(success).toBe(false);

      expect(mockListeners.activeGameAlert).toBeCalledWith(false);
    });
  });
});
