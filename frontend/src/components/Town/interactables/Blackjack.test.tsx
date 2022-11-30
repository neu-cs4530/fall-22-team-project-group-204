import { ChakraProvider } from '@chakra-ui/react';
import { EventNames } from '@socket.io/component-emitter';
import { act, cleanup, fireEvent, render, RenderResult, waitFor } from '@testing-library/react';
import { mock, MockProxy } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import React from 'react';
import GamingAreaController, { GamingAreaEvents } from '../../../classes/GamingAreaController';
import TownController from '../../../classes/TownController';
import TownControllerContext from '../../../contexts/TownControllerContext';
import { BlackjackPlayer } from '../../../types/CoveyTownSocket';
import { Blackjack, Hand, Hands, PlayingCardImage } from './BlackjackModal';

const mockToast = jest.fn();

jest.mock('@chakra-ui/react', () => {
  const ui = jest.requireActual('@chakra-ui/react');
  const mockUseToast = () => mockToast;
  return {
    ...ui,
    useToast: mockUseToast,
  };
});

function renderBlackjack(gamingArea: GamingAreaController, controller: TownController) {
  return (
    <ChakraProvider>
      <TownControllerContext.Provider value={controller}>
        <Blackjack controller={gamingArea} />
      </TownControllerContext.Provider>
    </ChakraProvider>
  );
}

describe('Blackjack Modal', () => {
  let gamingArea: GamingAreaController;
  type GamingAreaEventName = keyof GamingAreaEvents;
  let addListenerSpy: jest.SpyInstance<
    GamingAreaController,
    [event: GamingAreaEventName, listener: GamingAreaEvents[GamingAreaEventName]]
  >;

  let removeListenerSpy: jest.SpyInstance<
    GamingAreaController,
    [event: GamingAreaEventName, listener: GamingAreaEvents[GamingAreaEventName]]
  >;

  let townController: MockProxy<TownController>;
  let renderData: RenderResult;
  let joinButton: HTMLElement;
  let leaveButton: HTMLElement;
  let startGameButton: HTMLElement;
  let hitButton: HTMLElement;
  let standButton: HTMLElement;

  beforeEach(() => {
    townController = mock<TownController>();
    const dealer: BlackjackPlayer = {
      id: '0',
      hand: [],
      gameStatus: 'Waiting',
    };
    const players: BlackjackPlayer[] = [];
    gamingArea = new GamingAreaController({
      id: 'test',
      dealer: dealer,
      players: players,
      bettingAmount: 0,
    });
    townController.createBlackjackArea({
      id: 'test',
      dealer: dealer,
      players: players,
      bettingAmount: 0,
    });
    addListenerSpy = jest.spyOn(gamingArea, 'addListener');
    removeListenerSpy = jest.spyOn(gamingArea, 'removeListener');

    renderData = render(renderBlackjack(gamingArea, townController));
    joinButton = renderData.getByTestId('joinButton');
    hitButton = renderData.getByTestId('hitButton');
    standButton = renderData.getByTestId('standButton');
  });

  /**
   * Retrieve the listener passed to "addListener" for a given eventName
   * @throws Error if the addListener method was not invoked exactly once for the given eventName
   */
  function getSingleListenerAdded<Ev extends EventNames<GamingAreaEvents>>(
    eventName: Ev,
    spy = addListenerSpy,
  ): GamingAreaEvents[Ev] {
    const addedListeners = spy.mock.calls.filter(eachCall => eachCall[0] === eventName);
    if (addedListeners.length !== 1) {
      throw new Error(
        `Expected to find exactly one addListener call for ${eventName} but found ${addedListeners.length}`,
      );
    }
    return (addedListeners[0][1] as unknown) as GamingAreaEvents[Ev];
  }
  /**
   * Retrieve the listener pased to "removeListener" for a given eventName
   * @throws Error if the removeListener method was not invoked exactly once for the given eventName
   */
  function getSingleListenerRemoved<Ev extends EventNames<GamingAreaEvents>>(
    eventName: Ev,
  ): GamingAreaEvents[Ev] {
    const removedListeners = removeListenerSpy.mock.calls.filter(
      eachCall => eachCall[0] === eventName,
    );
    if (removedListeners.length !== 1) {
      throw new Error(
        `Expected to find exactly one removeListeners call for ${eventName} but found ${removedListeners.length}`,
      );
    }
    return (removedListeners[0][1] as unknown) as GamingAreaEvents[Ev];
  }
  describe('Rendering Blackjack for first time', () => {
    it('Has Blackjack button and text components', async () => {
      await waitFor(() => expect(renderData.getByText('Bet')).toBeInTheDocument());
      await waitFor(() => expect(renderData.getByText('Join')).toBeInTheDocument());
      await waitFor(() => expect(renderData.getByText('Hit')).toBeInTheDocument());
      await waitFor(() => expect(renderData.getByText('Stand')).toBeInTheDocument());
      await waitFor(() => expect(renderData.getByText('1')).toBeInTheDocument());
      await waitFor(() => expect(renderData.getByText('5')).toBeInTheDocument());
      await waitFor(() => expect(renderData.getByText('25')).toBeInTheDocument());
      await waitFor(() => expect(renderData.getByText('100')).toBeInTheDocument());
      await waitFor(() => expect(renderData.getByText('500')).toBeInTheDocument());
      const numButtons = renderData.getAllByRole('button');
      expect(numButtons).toHaveLength(11);
      const numChips = renderData.getAllByRole('button', { name: 'chip' });
      expect(numChips).toHaveLength(5);
      renderData.unmount();
    }, 10000);
  });
  describe('Bridging events from the GamingAreaController to the ReactPlayer', () => {
    describe('Registering GamingAreaController listeners', () => {
      it('Registers exactly one dealerChange listener', () => {
        act(() => {
          gamingArea.emit('dealerChange', {
            id: nanoid(),
            gameStatus: 'Waiting',
            hand: [
              { value: '3', suit: 'Hearts', faceUp: false },
              { value: '4', suit: 'Hearts', faceUp: true },
            ],
          });
        });
        act(() => {
          gamingArea.emit('dealerChange', {
            id: nanoid(),
            gameStatus: 'Waiting',
            hand: [
              { value: '3', suit: 'Hearts', faceUp: false },
              { value: '4', suit: 'Hearts', faceUp: true },
            ],
          });
        });
        act(() => {
          gamingArea.emit('dealerChange', {
            id: nanoid(),
            gameStatus: 'Waiting',
            hand: [
              { value: '3', suit: 'Hearts', faceUp: false },
              { value: '4', suit: 'Hearts', faceUp: true },
            ],
          });
        });
        getSingleListenerAdded('dealerChange');
      });
      it('Removes the dealerChange listener at unmount', () => {
        act(() => {
          gamingArea.emit('dealerChange', {
            id: nanoid(),
            gameStatus: 'Waiting',
            hand: [
              { value: '3', suit: 'Hearts', faceUp: false },
              { value: '4', suit: 'Hearts', faceUp: true },
            ],
          });
        });
        const listenerAdded = getSingleListenerAdded('dealerChange');
        cleanup();
        expect(getSingleListenerRemoved('dealerChange')).toBe(listenerAdded);
      });
      it('Registers exactly one playersChange listener', () => {
        act(() => {
          gamingArea.emit('playersChange', [
            {
              id: nanoid(),
              gameStatus: 'Waiting',
              hand: [
                { value: '3', suit: 'Hearts', faceUp: false },
                { value: '4', suit: 'Hearts', faceUp: true },
              ],
            },
            {
              id: nanoid(),
              gameStatus: 'Waiting',
              hand: [
                { value: '3', suit: 'Hearts', faceUp: false },
                { value: '4', suit: 'Hearts', faceUp: true },
              ],
            },
          ]);
        });
        act(() => {
          gamingArea.emit('playersChange', [
            {
              id: nanoid(),
              gameStatus: 'Waiting',
              hand: [
                { value: '3', suit: 'Hearts', faceUp: false },
                { value: '4', suit: 'Hearts', faceUp: true },
              ],
            },
            {
              id: nanoid(),
              gameStatus: 'Waiting',
              hand: [
                { value: '5', suit: 'Hearts', faceUp: false },
                { value: '6', suit: 'Hearts', faceUp: true },
              ],
            },
          ]);
        });
        act(() => {
          gamingArea.emit('playersChange', [
            {
              id: nanoid(),
              gameStatus: 'Waiting',
              hand: [
                { value: '3', suit: 'Hearts', faceUp: false },
                { value: '4', suit: 'Hearts', faceUp: true },
              ],
            },
            {
              id: nanoid(),
              gameStatus: 'Waiting',
              hand: [
                { value: '5', suit: 'Hearts', faceUp: false },
                { value: '6', suit: 'Hearts', faceUp: true },
              ],
            },
          ]);
        });
        getSingleListenerAdded('playersChange');
      });
      it('Removes the playersChange listener at unmount', () => {
        act(() => {
          gamingArea.emit('playersChange', [
            {
              id: nanoid(),
              gameStatus: 'Waiting',
              hand: [
                { value: '3', suit: 'Hearts', faceUp: false },
                { value: '4', suit: 'Hearts', faceUp: true },
              ],
            },
            {
              id: nanoid(),
              gameStatus: 'Waiting',
              hand: [
                { value: '5', suit: 'Hearts', faceUp: false },
                { value: '6', suit: 'Hearts', faceUp: true },
              ],
            },
          ]);
        });
        const listenerAdded = getSingleListenerAdded('playersChange');
        cleanup();
        expect(getSingleListenerRemoved('playersChange')).toBe(listenerAdded);
      });
      it('Registers exactly one activeGameAlert listener', () => {
        act(() => {
          gamingArea.emit('activeGameAlert', true);
        });
        act(() => {
          gamingArea.emit('activeGameAlert', false);
        });
        act(() => {
          gamingArea.emit('activeGameAlert', true);
        });
        act(() => {
          gamingArea.emit('activeGameAlert', false);
        });
        getSingleListenerAdded('activeGameAlert');
      });
      it('Removes the activeGameAlert listener at unmount', () => {
        act(() => {
          gamingArea.emit('activeGameAlert', true);
        });
        const listenerAdded = getSingleListenerAdded('activeGameAlert');
        cleanup();
        expect(getSingleListenerRemoved('activeGameAlert')).toBe(listenerAdded);
      });
    });
    describe('When clicking Join button on Blackjack game', () => {
      it("updates the gaming area controller's model and emits an update to the town", () => {
        expect(gamingArea.players).toStrictEqual([]);
        act(() => {
          fireEvent.click(joinButton);
        });
        expect(gamingArea.players.length).toBe(1);
        expect(townController.emitGamingAreaUpdate).toBeCalledWith(gamingArea);
      });
      it('join button changes to a leave button', () => {
        expect(renderData.getByText('Join')).toBeInTheDocument();
        const leaveButtons = renderData.queryByText('Leave');
        expect(leaveButtons).not.toBeInTheDocument();
        act(() => {
          fireEvent.click(joinButton);
        });
        const joinButtons = renderData.queryByText('Join');
        expect(joinButtons).not.toBeInTheDocument();
        expect(renderData.getByText('Leave')).toBeInTheDocument();
      });
      it("displays an error toast 'Can't leave a game you have started!' if user leaves a started game", async () => {
        act(() => {
          fireEvent.click(joinButton);
        });
        act(() => {
          leaveButton = renderData.getByTestId('leaveButton');
          fireEvent.click(leaveButton);
        });
        await waitFor(() =>
          expect(mockToast).toBeCalledWith({
            duration: 2000,
            title: "Can't leave a game you have started!",
            status: 'error',
            isClosable: false,
          }),
        );
      });
      it("displays an error toast 'Can't join an active game!' if user tries to join an active game", async () => {
        act(() => {
          gamingArea.emit('dealerChange', { id: '0', hand: [], gameStatus: 'Playing' });
        });
        act(() => {
          fireEvent.click(joinButton);
        });
        await waitFor(() =>
          expect(mockToast).toBeCalledWith({
            duration: 2000,
            title: "Can't join an active game!",
            status: 'error',
            isClosable: false,
          }),
        );
      });
    });
    describe('When clicking Start Game button', () => {
      it('Start button appears with correct text', () => {
        startGameButton = renderData.getByTestId('startGameButton');
        expect(startGameButton.innerHTML).toBe('Start Game');
        act(() => {
          gamingArea.emit('dealerChange', { id: '0', hand: [], gameStatus: 'Playing' });
        });
        expect(startGameButton.innerHTML).toBe('Game In Progress');
        act(() => {
          gamingArea.emit('dealerChange', { id: '0', hand: [], gameStatus: 'Waiting' });
        });
        expect(startGameButton.innerHTML).toBe('Start Game');
      });
      it('Start game button sends a Start update to the controller and emits an update to the town', () => {
        startGameButton = renderData.getByTestId('startGameButton');
        act(() => {
          fireEvent.click(startGameButton);
        });
        expect(gamingArea.update).toEqual({
          id: townController.userID,
          action: 'Start',
          timestamp: '0',
        });
        expect(townController.emitGamingAreaUpdate).toBeCalledWith(gamingArea);
      });
    });
    describe('When clicking Hit button', () => {
      it('Hit button sends a Hit update to the controller and emits an update to the town', () => {
        act(() => {
          fireEvent.click(hitButton);
        });
        expect(gamingArea.update).toEqual({
          id: townController.userID,
          action: 'Hit',
          timestamp: '0',
        });
        expect(townController.emitGamingAreaUpdate).toBeCalledWith(gamingArea);
      });
    });
    describe('When clicking Stand button', () => {
      it('Stand button sends a Stay update to the controller and emits an update to the town', () => {
        act(() => {
          fireEvent.click(standButton);
        });
        expect(gamingArea.update).toEqual({
          id: townController.userID,
          action: 'Stay',
          timestamp: '0',
        });
        expect(townController.emitGamingAreaUpdate).toBeCalledWith(gamingArea);
      });
    });
    describe('Timestamps', () => {
      it('Timestamps increase every Hit, Stand, or Start button click', () => {
        startGameButton = renderData.getByTestId('startGameButton');
        act(() => {
          fireEvent.click(startGameButton);
        });
        expect(gamingArea.update?.timestamp).toBe('0');
        act(() => {
          fireEvent.click(standButton);
        });
        expect(gamingArea.update?.timestamp).toBe('1');
        act(() => {
          fireEvent.click(hitButton);
        });
        expect(gamingArea.update?.timestamp).toBe('2');
      });
    });
    describe('PlayingCardImage', () => {
      it('Generates an image from a playing card id and position', () => {
        const image1 = PlayingCardImage({ cardId: 1, x: 0, y: 0 });
        const image2 = PlayingCardImage({ cardId: 22, x: 100, y: 200 });
        const image3 = PlayingCardImage({ cardId: 53, x: -10, y: -4000 });
        expect(image1.props.src).toBe('assets/blackjack/playingcards/playingcards_01.png');
        expect(image1.props.top).toBe('0px');
        expect(image1.props.left).toBe('0px');
        expect(image2.props.src).toBe('assets/blackjack/playingcards/playingcards_22.png');
        expect(image2.props.top).toBe('200px');
        expect(image2.props.left).toBe('100px');
        expect(image3.props.src).toBe('assets/blackjack/playingcards/playingcards_53.png');
        expect(image3.props.top).toBe('-4000px');
        expect(image3.props.left).toBe('-10px');
      });
    });
    describe('Hand', () => {
      it('Generates an hand component from playing card and a position', () => {
        const hand1 = Hand({ cards: [{ value: 'A', suit: 'Spades', faceUp: true }], x: 0, y: 0 });
        const hand1Data = render(hand1);
        const playingCards1 = hand1Data.getAllByTestId('playingCardImage');
        expect(playingCards1[0].getAttribute('src')).toBe(
          'assets/blackjack/playingcards/playingcards_13.png',
        );
      });
      it('Generates an hand component from playing cards and a position', () => {
        const hand2 = Hand({
          cards: [
            { value: '4', suit: 'Spades', faceUp: true },
            { value: '10', suit: 'Diamonds', faceUp: false },
          ],
          x: 10,
          y: -10,
        });

        const hand2Data = render(hand2);
        const playingCards2 = hand2Data.getAllByTestId('playingCardImage');
        expect(playingCards2[0].getAttribute('src')).toBe(
          'assets/blackjack/playingcards/playingcards_03.png',
        );
        expect(playingCards2[1].getAttribute('src')).toBe(
          'assets/blackjack/playingcards/playingcards_53.png',
        );
      });
    });
    describe('Hands', () => {
      it('Generates a group of Hand components and places them in appropriate positions', () => {
        const hands = Hands({
          hands: [
            {
              id: townController.userID,
              hand: [{ value: 'A', suit: 'Spades', faceUp: true }],
              gameStatus: 'Waiting',
            },
            {
              id: 'player2',
              hand: [{ value: '7', suit: 'Diamonds', faceUp: true }],
              gameStatus: 'Waiting',
            },
            {
              id: 'player3',
              hand: [{ value: '2', suit: 'Hearts', faceUp: true }],
              gameStatus: 'Waiting',
            },
            {
              id: 'player4',
              hand: [{ value: '4', suit: 'Diamonds', faceUp: true }],
              gameStatus: 'Waiting',
            },
            {
              id: 'player5',
              hand: [{ value: 'Q', suit: 'Clubs', faceUp: true }],
              gameStatus: 'Waiting',
            },
          ],
          userID: townController.userID,
        });

        renderData.unmount();
        const handsData = render(hands);
        const handComponents = handsData.getAllByTestId('hand');
        expect(handComponents.length).toBe(5);
      });
    });
  });
});
