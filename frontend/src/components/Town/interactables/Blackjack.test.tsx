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
import { Blackjack } from './BlackjackModal';

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

  beforeEach(() => {
    townController = mock<TownController>();
    const dealer: BlackjackPlayer = { id: '0', hand: [] };
    const players: BlackjackPlayer[] = [];
    gamingArea = new GamingAreaController({
      id: 'test',
      dealer: dealer,
      players: players,
      gameStatus: 'Waiting',
    });
    addListenerSpy = jest.spyOn(gamingArea, 'addListener');
    removeListenerSpy = jest.spyOn(gamingArea, 'removeListener');

    renderData = render(renderBlackjack(gamingArea, townController));
    joinButton = renderData.getByTestId('joinButton');
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
    return addedListeners[0][1] as unknown as GamingAreaEvents[Ev];
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
    return removedListeners[0][1] as unknown as GamingAreaEvents[Ev];
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
      expect(numButtons).toHaveLength(9);
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
            hand: [
              { value: '3', suit: 'Hearts', faceUp: false },
              { value: '4', suit: 'Hearts', faceUp: true },
            ],
          });
        });
        act(() => {
          gamingArea.emit('dealerChange', {
            id: nanoid(),
            hand: [
              { value: '3', suit: 'Hearts', faceUp: false },
              { value: '4', suit: 'Hearts', faceUp: true },
            ],
          });
        });
        act(() => {
          gamingArea.emit('dealerChange', {
            id: nanoid(),
            hand: [
              { value: '3', suit: 'Hearts', faceUp: false },
              { value: '4', suit: 'Hearts', faceUp: true },
            ],
          });
        });
        getSingleListenerAdded('dealerChange');
      });
      // it('Registers exactly one playersChange listener', () => {
      //   act(() => {
      //     gamingArea.emit('playersChange', [
      //       {
      //         id: nanoid(),
      //         hand: [
      //           { value: '3', suit: 'Hearts', faceUp: false },
      //           { value: '4', suit: 'Hearts', faceUp: true },
      //         ],
      //       },
      //       {
      //         id: nanoid(),
      //         hand: [
      //           { value: '3', suit: 'Hearts', faceUp: false },
      //           { value: '4', suit: 'Hearts', faceUp: true },
      //         ],
      //       },
      //     ]);
      //   });
      //   act(() => {
      //     gamingArea.emit('playersChange', [
      //       {
      //         id: nanoid(),
      //         hand: [
      //           { value: '3', suit: 'Hearts', faceUp: false },
      //           { value: '4', suit: 'Hearts', faceUp: true },
      //         ],
      //       },
      //       {
      //         id: nanoid(),
      //         hand: [
      //           { value: '5', suit: 'Hearts', faceUp: false },
      //           { value: '6', suit: 'Hearts', faceUp: true },
      //         ],
      //       },
      //     ]);
      //   });
      //   act(() => {
      //     gamingArea.emit('playersChange', [
      //       {
      //         id: nanoid(),
      //         hand: [
      //           { value: '3', suit: 'Hearts', faceUp: false },
      //           { value: '4', suit: 'Hearts', faceUp: true },
      //         ],
      //       },
      //       {
      //         id: nanoid(),
      //         hand: [
      //           { value: '5', suit: 'Hearts', faceUp: false },
      //           { value: '6', suit: 'Hearts', faceUp: true },
      //         ],
      //       },
      //     ]);
      //   });
      //   getSingleListenerAdded('playersChange');
      // });
      // it('Removes the playersChange listener at unmount', () => {
      //   act(() => {
      //     gamingArea.emit('playersChange', [
      //       {
      //         id: nanoid(),
      //         hand: [
      //           { value: '3', suit: 'Hearts', faceUp: false },
      //           { value: '4', suit: 'Hearts', faceUp: true },
      //         ],
      //       },
      //       {
      //         id: nanoid(),
      //         hand: [
      //           { value: '5', suit: 'Hearts', faceUp: false },
      //           { value: '6', suit: 'Hearts', faceUp: true },
      //         ],
      //       },
      //     ]);
      //   });
      //   const listenerAdded = getSingleListenerAdded('playersChange');
      //   cleanup();
      //   expect(getSingleListenerRemoved('playersChange')).toBe(listenerAdded);
      // });
      it('Registers exactly one gameStatusChange listener', () => {
        act(() => {
          gamingArea.emit('gameStatusChange', 'Playing');
        });
        act(() => {
          gamingArea.emit('gameStatusChange', 'Waiting');
        });
        act(() => {
          gamingArea.emit('gameStatusChange', 'Playing');
        });
        getSingleListenerAdded('gameStatusChange');
      });
      it('Removes the gameStatusChange listener at unmount', () => {
        act(() => {
          gamingArea.emit('gameStatusChange', 'Waiting');
        });
        const listenerAdded = getSingleListenerAdded('gameStatusChange');
        cleanup();
        expect(getSingleListenerRemoved('gameStatusChange')).toBe(listenerAdded);
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
    });
  });
});
