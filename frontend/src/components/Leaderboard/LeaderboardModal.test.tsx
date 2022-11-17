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

  const openLeaderboardModal = async () => {
    mockedTownController = mockTownController({
      friendlyName: nanoid(),
      townID: nanoid(),
      townIsPubliclyListed: true,
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

  it('Displays a Blackjack Leaderboard Modal', async () => {
    await openLeaderboardModal();
    await waitFor(() => expect(renderData.getByText('Blackjack Leaderboard')).toBeInTheDocument());
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
