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
import { PlayerStanding } from '../../../../shared/types/CoveyTownSocket';
import useTownController from '../../hooks/useTownController';
import { DataTable } from './DataTable';

export default function LeaderboardModal({
  rankingData,
}: {
  rankingData: PlayerStanding[];
}): JSX.Element {
  const coveyTownController = useTownController();
  const data: PlayerStanding[] = rankingData;

  console.log(data);
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
