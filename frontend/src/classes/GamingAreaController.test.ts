import { mock, mockClear, MockProxy } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { BlackjackArea, BlackjackPlayer, PlayingCard } from '../generated/client';
import TownController from './TownController';
import GamingAreaController, { GamingAreaEvents } from './GamingAreaController';

describe('GamingAreaController', () => {
  // A valid ViewingAreaController to be reused within the tests
  let testArea: GamingAreaController;
  let testAreaModel: BlackjackArea;
  const townController: MockProxy<TownController> = mock<TownController>();
  const mockListeners = mock<GamingAreaEvents>();
  beforeEach(() => {
    testAreaModel = {
      id: nanoid(),
      dealer: { id: '0', hand: [] },
      players: [],
      gameStatus: 'Waiting',
    };
    testArea = new GamingAreaController(testAreaModel);
    mockClear(townController);
    mockClear(mockListeners.dealerChange);
    mockClear(mockListeners.playersChange);
    mockClear(mockListeners.gameStatusChange);
    mockClear(mockListeners.activeGameAlert);
    testArea.addListener('dealerChange', mockListeners.dealerChange);
    testArea.addListener('playersChange', mockListeners.playersChange);
    testArea.addListener('gameStatusChange', mockListeners.gameStatusChange);
    testArea.addListener('activeGameAlert', mockListeners.activeGameAlert);
  });
  describe('Setting dealer property', () => {
    it('updates the property and emits a dealerChange event if the property changes', () => {
      const newDealerHand = { id: '0', hand: [{ value: 'Ace', suit: 'Spades', faceUp: true }] };
      testArea.dealer = newDealerHand;
      expect(mockListeners.dealerChange).toBeCalledWith(newDealerHand);
      expect(testArea.dealer).toEqual(newDealerHand);
    });
    it('does not emit a dealerChange event if the dealer property does not change', () => {
      const newDealerHand: BlackjackPlayer = { id: '0', hand: [] };
      testArea.dealer = newDealerHand;
      expect(mockListeners.dealerChange).not.toBeCalled();
    });
  });
  describe('Setting players property', () => {
    it('updates the model and emits a playersChange event if the property changes', () => {
      const newBlackjackPlayers = [
        { id: 'player1', hand: [{ value: 'Ace', suit: 'Spades', faceUp: true }] },
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
  describe('Setting gameStatus property', () => {
    it('updates the model and emits a gameStatusChange event if the property changes', () => {
      const newValue = 'Playing';
      testArea.gameStatus = newValue;
      expect(mockListeners.gameStatusChange).toBeCalledWith(newValue);
      expect(testArea.gameStatus).toEqual(newValue);
    });
    it('does not emit a gameStatusChange event if the gameStatus property does not change', () => {
      const existingValue = testAreaModel.gameStatus;
      testArea.gameStatus = existingValue;
      expect(mockListeners.gameStatusChange).not.toBeCalled();
    });
  });
  describe('gamingAreaModel', () => {
    it('Carries through all of the properties', () => {
      const model = testArea.gamingAreaModel();
      expect(model).toEqual(testAreaModel);
    });
  });
  describe('updateFrom', () => {
    it('Updates the isPlaying, elapsedTimeSec and video properties', () => {
      const newModel: BlackjackArea = {
        id: testAreaModel.id,
        dealer: { id: '0', hand: [{ value: 'Ace', suit: 'Spades', faceUp: true }] },
        players: [{ id: 'player1', hand: [{ value: 'Ace', suit: 'Spades', faceUp: true }] }],
        gameStatus: 'Playing',
      };
      testArea.updateFrom(newModel);
      expect(testArea.dealer).toEqual(newModel.dealer);
      expect(testArea.players).toEqual(newModel.players);
      expect(testArea.gameStatus).toEqual(newModel.gameStatus);
      expect(mockListeners.dealerChange).toBeCalledWith(newModel.dealer);
      expect(mockListeners.playersChange).toBeCalledWith(newModel.players);
      expect(mockListeners.gameStatusChange).toBeCalledWith(newModel.gameStatus);
    });
    it('Does not update the id property', () => {
      const existingID = testArea.id;
      const newModel: BlackjackArea = {
        id: nanoid(),
        dealer: { id: '0', hand: [{ value: 'Ace', suit: 'Spades', faceUp: true }] },
        players: [{ id: 'player1', hand: [{ value: 'Ace', suit: 'Spades', faceUp: true }] }],
        gameStatus: 'Playing',
      };
      testArea.updateFrom(newModel);
      expect(testArea.id).toEqual(existingID);
    });
  });
});
