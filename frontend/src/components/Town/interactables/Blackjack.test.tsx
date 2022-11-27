import { ChakraProvider } from '@chakra-ui/react';
import { EventNames } from '@socket.io/component-emitter';
import { act, cleanup, render, RenderResult } from '@testing-library/react';
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
  describe('[T4] Bridging events from the GamingAreaController to the ReactPlayer', () => {
    describe('Registering GamingAreaController listeners', () => {
      describe('When rendered', () => {
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
    });
  });
});
