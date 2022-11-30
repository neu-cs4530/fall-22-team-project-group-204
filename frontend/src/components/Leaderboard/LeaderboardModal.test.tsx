import { ChakraProvider, UseDisclosureReturn } from '@chakra-ui/react';
import { act, cleanup, fireEvent, render, RenderResult, waitFor } from '@testing-library/react';
import { mock, MockProxy } from 'jest-mock-extended';
import React from 'react';
import GamingAreaController, { GamingAreaEvents } from '../../classes/GamingAreaController';
import TownController from '../../classes/TownController';
import TownControllerContext from '../../contexts/TownControllerContext';
import { EventNames } from '../../TestUtils';
import { BlackjackPlayer } from '../../types/CoveyTownSocket';
import LeaderboardModal from './LeaderboardModal';

const mockUseDisclosure = mock<UseDisclosureReturn>();
mockUseDisclosure.isOpen = true;

jest.mock('@chakra-ui/react', () => {
  const ui = jest.requireActual('@chakra-ui/react');
  return {
    ...ui,
    useDisclosure: () => {
      return mockUseDisclosure;
    },
  };
});

function renderLeaderboard(gamingArea: GamingAreaController, controller: TownController) {
  return (
    <ChakraProvider>
      <TownControllerContext.Provider value={controller}>
        <LeaderboardModal controller={gamingArea} />
      </TownControllerContext.Provider>
    </ChakraProvider>
  );
}

describe('Leaderboard Modal', () => {
  let renderData: RenderResult;
  let gamingArea: GamingAreaController;
  let doneButton: HTMLElement;
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
      playerStandings: [],
    });
    townController.createBlackjackArea({
      id: 'test',
      dealer: dealer,
      players: players,
      bettingAmount: 0,
      playerStandings: [],
    });
    addListenerSpy = jest.spyOn(gamingArea, 'addListener');
    removeListenerSpy = jest.spyOn(gamingArea, 'removeListener');

    renderData = render(renderLeaderboard(gamingArea, townController));
    doneButton = renderData.getByTestId('donebutton');
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

  beforeEach(async () => {
    mockUseDisclosure.onClose.mockReset();
  });

  describe('Rendering Leaderboard for first time', () => {
    it('Displays a Blackjack Leaderboard Modal', async () => {
      await waitFor(() =>
        expect(renderData.getByText('Blackjack Leaderboard')).toBeInTheDocument(),
      );
      const rankingText = await renderData.findAllByText('Ranking');
      expect(rankingText).toHaveLength(2);
      const nameText = await renderData.findAllByText('Name');
      expect(nameText).toHaveLength(2);
      const winsText = await renderData.findAllByText('Wins');
      expect(winsText).toHaveLength(2);
      const rewardText = await renderData.findAllByText('Reward');
      expect(rewardText).toHaveLength(2);
      renderData.unmount();
    }, 10000);
  });
  describe('Leaderboard closes', () => {
    it('when Done button is clicked', async () => {
      fireEvent.click(doneButton);
      await waitFor(() => expect(townController.unPause).toBeCalled());
      await waitFor(() => expect(mockUseDisclosure.onClose).toBeCalled());
    }, 10000);
    it('when Shift key is pressed', async () => {
      await waitFor(() =>
        expect(renderData.getByText('Blackjack Leaderboard')).toBeInTheDocument(),
      );
      fireEvent.keyDown(global.window, { key: 'Shift', code: 16, charCode: 16 });
      await waitFor(() => expect(townController.unPause).toBeCalled());
      await waitFor(() => expect(mockUseDisclosure.onClose).toBeCalled());
    }, 10000);
    it('Leaderboard Modal should not close when any other key is pressed', async () => {
      await waitFor(() =>
        expect(renderData.getByText('Blackjack Leaderboard')).toBeInTheDocument(),
      );
      fireEvent.keyDown(global.window, { key: 'a', code: 65, charCode: 65 });
      await waitFor(() => expect(townController.unPause).not.toBeCalled());
      await waitFor(() => expect(mockUseDisclosure.onClose).not.toBeCalled());
    }, 10000);
  });
  describe('Bridging events from the GamingAreaController to the LeaderboardModal', () => {
    describe('Registering GamingAreaController listeners', () => {
      it('Registers exactly one leaderboardChange listener', () => {
        act(() => {
          gamingArea.emit('leaderboardChange', []);
        });
        act(() => {
          gamingArea.emit('leaderboardChange', []);
        });
        act(() => {
          gamingArea.emit('leaderboardChange', []);
        });
        getSingleListenerAdded('leaderboardChange');
      });
      it('Removes the leaderboardChange listener at unmount', () => {
        act(() => {
          gamingArea.emit('leaderboardChange', []);
        });
        const listenerAdded = getSingleListenerAdded('leaderboardChange');
        cleanup();
        expect(getSingleListenerRemoved('leaderboardChange')).toBe(listenerAdded);
      });
    });
  });
});
