import { ChakraProvider, UseDisclosureReturn } from '@chakra-ui/react';
import { render, RenderResult, waitFor } from '@testing-library/react';
import { mock, MockProxy } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import React from 'react';
import TownController from '../../classes/TownController';
import TownControllerContext from '../../contexts/TownControllerContext';
import { mockTownController } from '../../TestUtils';
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

describe('Leaderboard Modal', () => {
  let renderData: RenderResult;
  let mockedTownController: MockProxy<TownController>;

  const openLeaderboardModal = async (params: {
    friendlyName: string;
    isPubliclyListed: boolean;
    townID: string;
  }) => {
    mockedTownController = mockTownController({
      friendlyName: params.friendlyName,
      townID: params.townID,
      townIsPubliclyListed: params.isPubliclyListed,
    });

    renderData = render(
      <ChakraProvider>
        <TownControllerContext.Provider value={mockedTownController}>
          <LeaderboardModal />
        </TownControllerContext.Provider>
      </ChakraProvider>,
    );

    await waitFor(() => renderData.getByText('Blackjack Leaderboard'));
  };

  beforeEach(async () => {
    mockUseDisclosure.onClose.mockReset();
  });

  it('Displays a heading Blackjack Leaderboard', async () => {
    const params = {
      friendlyName: nanoid(),
      isPubliclyListed: true,
      townID: nanoid(),
    };
    await openLeaderboardModal(params);
    await waitFor(() => expect(renderData.getByText('Blackjack Leaderboard')).toBeInTheDocument());
  }, 10000);
});
