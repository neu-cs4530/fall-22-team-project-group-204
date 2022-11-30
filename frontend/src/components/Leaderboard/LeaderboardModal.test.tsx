import { ChakraProvider, UseDisclosureReturn } from '@chakra-ui/react';
import { fireEvent, render, RenderResult, waitFor } from '@testing-library/react';
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
  let doneButton: HTMLElement;

  const openLeaderboardModal = async () => {
    mockedTownController = mockTownController({
      friendlyName: nanoid(),
      townID: nanoid(),
      townIsPubliclyListed: true,
    });

    renderData = render(
      <ChakraProvider>
        <TownControllerContext.Provider value={mockedTownController}>
          <LeaderboardModal rankingData={[]} />
        </TownControllerContext.Provider>
      </ChakraProvider>,
    );

    await waitFor(() => renderData.getByText('Blackjack Leaderboard'));
    doneButton = renderData.getByTestId('donebutton');
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
  it('Leaderboard Modal closes when Done button is clicked', async () => {
    await openLeaderboardModal();
    fireEvent.click(doneButton);
    await waitFor(() => expect(mockedTownController.unPause).toBeCalled());
    await waitFor(() => expect(mockUseDisclosure.onClose).toBeCalled());
  }, 10000);
  it('Leaderboard Modal closes when Shift key is pressed', async () => {
    await openLeaderboardModal();
    await waitFor(() => expect(renderData.getByText('Blackjack Leaderboard')).toBeInTheDocument());
    fireEvent.keyDown(global.window, { key: 'Shift', code: 16, charCode: 16 });
    await waitFor(() => expect(mockedTownController.unPause).toBeCalled());
    await waitFor(() => expect(mockUseDisclosure.onClose).toBeCalled());
  }, 10000);
  it('Leaderboard Modal should not close when any other key is pressed', async () => {
    await openLeaderboardModal();
    await waitFor(() => expect(renderData.getByText('Blackjack Leaderboard')).toBeInTheDocument());
    fireEvent.keyDown(global.window, { key: 'a', code: 65, charCode: 65 });
    await waitFor(() => expect(mockedTownController.unPause).not.toBeCalled());
    await waitFor(() => expect(mockUseDisclosure.onClose).not.toBeCalled());
  }, 10000);
});
