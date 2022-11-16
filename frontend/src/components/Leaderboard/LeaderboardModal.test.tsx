import { ChakraProvider } from '@chakra-ui/react';
import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import { render, RenderResult, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { nanoid } from 'nanoid';
import React from 'react';
import TownController, * as TownControllerHooks from '../../classes/TownController';
import PlayerController from '../../classes/PlayerController';
import * as useTownController from '../../hooks/useTownController';
import { mockTownController } from '../../TestUtils';
import { PlayerLocation } from '../../types/CoveyTownSocket';
import LeaderboardModal from './LeaderboardModal';

describe('LeaderboardModal', () => {
  const wrappedLeaderBoardModalComponent = () => (
    <ChakraProvider>
      <React.StrictMode>
        <LeaderboardModal />
      </React.StrictMode>
    </ChakraProvider>
  );
  const renderLeaderboard = () => render(wrappedLeaderBoardModalComponent());
  const randomLocation = (): PlayerLocation => ({
    moving: Math.random() < 0.5,
    rotation: 'front',
    x: Math.random() * 1000,
    y: Math.random() * 1000,
  });
  let consoleErrorSpy: jest.SpyInstance<void, [message?: any, ...optionalParms: any[]]>;
  let useTownControllerSpy: jest.SpyInstance<TownController, []>;
  let townID: string;
  let townFriendlyName: string;

  beforeAll(() => {
    // Spy on console.error and intercept react key warnings to fail test
    consoleErrorSpy = jest.spyOn(global.console, 'error');
    consoleErrorSpy.mockImplementation((message?, ...optionalParams) => {
      const stringMessage = message as string;
      if (stringMessage.includes('children with the same key,')) {
        throw new Error(stringMessage.replace('%s', optionalParams[0]));
      } else if (stringMessage.includes('warning-keys')) {
        throw new Error(stringMessage.replace('%s', optionalParams[0]));
      }
      // eslint-disable-next-line no-console -- we are wrapping the console with a spy to find react warnings
      console.warn(message, ...optionalParams);
    });
    useTownControllerSpy = jest.spyOn(useTownController, 'default');
  });

  beforeEach(() => {
    townID = nanoid();
    townFriendlyName = nanoid();
    const mockedTownController = mockTownController({ friendlyName: townFriendlyName, townID });
    useTownControllerSpy.mockReturnValue(mockedTownController);
  });

  describe('LeaderboardModal', () => {
    it('Contains the text `Leaderboard`', async () => {
      const renderData = renderLeaderboard();
      const heading = await renderData.findByText('Leaderboard');
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Leaderboard');
    });

    it('Contains the text `Done`', async () => {
      const renderData = renderLeaderboard();
      const heading = await renderData.findByText('Leaderboard');
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Leaderboard');
    });
  });
});
