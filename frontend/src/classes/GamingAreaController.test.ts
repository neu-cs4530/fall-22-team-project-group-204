import { mock, mockClear, MockProxy } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { GamingArea, PlayerHand, PlayingCard } from '../generated/client';
import TownController from './TownController';
import GamingAreaController, { GamingAreaEvents } from './GamingAreaController';

describe('GamingAreaController', () => {
  // A valid ViewingAreaController to be reused within the tests
  let testArea: GamingAreaController;
  let testAreaModel: GamingArea;
  const townController: MockProxy<TownController> = mock<TownController>();
  const mockListeners = mock<GamingAreaEvents>();
  beforeEach(() => {
    testAreaModel = {
      id: nanoid(),
      dealerHand: [],
      playerHands: [],
      gameStatus: 'Waiting',
    };
    testArea = new GamingAreaController(testAreaModel);
    mockClear(townController);
    mockClear(mockListeners.dealerHandChange);
    mockClear(mockListeners.playerHandsChange);
    mockClear(mockListeners.gameStatusChange);
    mockClear(mockListeners.activeGameAlert);
    testArea.addListener('dealerHandChange', mockListeners.dealerHandChange);
    testArea.addListener('playerHandsChange', mockListeners.playerHandsChange);
    testArea.addListener('gameStatusChange', mockListeners.gameStatusChange);
    testArea.addListener('activeGameAlert', mockListeners.activeGameAlert);
  });
  describe('Setting dealerHand property', () => {
    it('updates the property and emits a dealerHandChange event if the property changes', () => {
      const newDealerHand = [{ value: 'Ace', suit: 'Spades', faceUp: true }];
      testArea.dealerHand = newDealerHand;
      expect(mockListeners.dealerHandChange).toBeCalledWith(newDealerHand);
      expect(testArea.dealerHand).toEqual(newDealerHand);
    });
    it('does not emit a dealerHandChange event if the dealerHand property does not change', () => {
      const newDealerHand: PlayingCard[] = [];
      testArea.dealerHand = newDealerHand;
      expect(mockListeners.dealerHandChange).not.toBeCalled();
    });
  });
  describe('Setting playerHands property', () => {
    it('updates the model and emits a playerHandsChange event if the property changes', () => {
      const newPlayerHands = [
        { id: 'player1', hand: [{ value: 'Ace', suit: 'Spades', faceUp: true }] },
      ];
      testArea.playerHands = newPlayerHands;
      expect(mockListeners.playerHandsChange).toBeCalledWith(newPlayerHands);
      expect(testArea.playerHands).toEqual(newPlayerHands);
    });
    it('does not emit a playerHandsChange event if the playerHands property does not change', () => {
      const newPlayerHands: PlayerHand[] = [];
      testArea.playerHands = newPlayerHands;
      expect(mockListeners.playerHandsChange).not.toBeCalled();
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
      const newModel: GamingArea = {
        id: testAreaModel.id,
        dealerHand: [{ value: 'Ace', suit: 'Spades', faceUp: true }],
        playerHands: [{ id: 'player1', hand: [{ value: 'Ace', suit: 'Spades', faceUp: true }] }],
        gameStatus: 'Playing',
      };
      testArea.updateFrom(newModel);
      expect(testArea.dealerHand).toEqual(newModel.dealerHand);
      expect(testArea.playerHands).toEqual(newModel.playerHands);
      expect(testArea.gameStatus).toEqual(newModel.gameStatus);
      expect(mockListeners.dealerHandChange).toBeCalledWith(newModel.dealerHand);
      expect(mockListeners.playerHandsChange).toBeCalledWith(newModel.playerHands);
      expect(mockListeners.gameStatusChange).toBeCalledWith(newModel.gameStatus);
    });
    it('Does not update the id property', () => {
      const existingID = testArea.id;
      const newModel: GamingArea = {
        id: nanoid(),
        dealerHand: [{ value: 'Ace', suit: 'Spades', faceUp: true }],
        playerHands: [{ id: 'player1', hand: [{ value: 'Ace', suit: 'Spades', faceUp: true }] }],
        gameStatus: 'Playing',
      };
      testArea.updateFrom(newModel);
      expect(testArea.id).toEqual(existingID);
    });
  });
});
