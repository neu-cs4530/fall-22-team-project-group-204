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
import useTownController from '../../hooks/useTownController';
import { DataTable } from './DataTable';

export default function LeaderboardModal(): JSX.Element {
  type PlayerStanding = {
    ranking: number;
    name: string;
    wins: number;
    balance: number;
  };

  const data: PlayerStanding[] = [
    {
      ranking: 1,
      name: 'Player1',
      wins: 6,
      balance: 400,
    },
    {
      ranking: 2,
      name: 'Player2',
      wins: 3,
      balance: 500,
    },
    {
      ranking: 3,
      name: 'Player3',
      wins: 2,
      balance: 320,
    },
    {
      ranking: 4,
      name: 'Player4',
      wins: 2,
      balance: 320,
    },
    {
      ranking: 5,
      name: 'Player5',
      wins: 1,
      balance: 140,
    },
    {
      ranking: 6,
      name: 'Player6',
      wins: 1,
      balance: 140,
    },
    {
      ranking: 7,
      name: 'Player7',
      wins: 1,
      balance: 140,
    },
    {
      ranking: 8,
      name: 'Player8',
      wins: 1,
      balance: 140,
    },
    {
      ranking: 9,
      name: 'Player9',
      wins: 0,
      balance: 0,
    },
    {
      ranking: 10,
      name: 'Player10',
      wins: 0,
      balance: 0,
    },
  ];

  const coveyTownController = useTownController();
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
