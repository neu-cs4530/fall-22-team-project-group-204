import {
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from '@chakra-ui/react';
import { createColumnHelper } from '@tanstack/react-table';
import React, { useCallback, useEffect } from 'react';
import { useGamingAreaController } from '../../classes/TownController';
import useTownController from '../../hooks/useTownController';
import BlackjackArea from '../Town/interactables/GamingArea';
import { DataTable } from './DataTable';

export type PlayerStanding = {
  ranking: number;
  name: string;
  wins: number;
  balance: number;
};

export default function LeaderboardModal({
  gamingArea,
}: {
  gamingArea: BlackjackArea;
}): JSX.Element {
  const gamingAreaController = useGamingAreaController(gamingArea.name);
  const coveyTownController = useTownController();
  const data: Promise<PlayerStanding[]> = gamingAreaController.leaderboard;

  const { isOpen, onOpen, onClose } = useDisclosure();

  const openLeaderboardModal = useCallback(() => {
    onOpen();
    coveyTownController.pause();
  }, [onOpen, coveyTownController]);

  const closeLeaderboardModal = useCallback(() => {
    onClose();
    coveyTownController.unPause();
  }, [onClose, coveyTownController]);

  useEffect(() => {
    const downHandler = ({ key }: { key: unknown }) => {
      if (key === 'Shift') {
        if (isOpen) {
          closeLeaderboardModal();
        } else {
          openLeaderboardModal();
        }
      }
    };
    window.addEventListener('keydown', downHandler);
    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener('keydown', downHandler);
    };
  });

  const columnHelper = createColumnHelper<PlayerStanding>();

  const columns = [
    columnHelper.accessor('ranking', {
      cell: info => info.getValue(),
      header: 'Ranking',
    }),
    columnHelper.accessor('name', {
      cell: info => info.getValue(),
      header: 'Name',
    }),
    columnHelper.accessor('wins', {
      cell: info => info.getValue(),
      header: 'Wins',
    }),
    columnHelper.accessor('balance', {
      cell: info => info.getValue(),
      header: 'Reward',
    }),
  ];

  return (
    <Modal size='xl' isOpen={isOpen} onClose={closeLeaderboardModal} scrollBehavior='inside'>
      <ModalContent>
        <ModalHeader>Blackjack Leaderboard</ModalHeader>
        <DataTable columns={columns} data={data} />
        <ModalFooter>
          <Button
            colorScheme='blue'
            data-testid='donebutton'
            mr={3}
            onClick={closeLeaderboardModal}>
            Done
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
