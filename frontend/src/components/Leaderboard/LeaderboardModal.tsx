/* eslint-disable @typescript-eslint/no-explicit-any */
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
    reward: number;
  };

  const data: PlayerStanding[] = [
    {
      ranking: 1,
      name: 'Player1',
      wins: 6,
      reward: 400,
    },
    {
      ranking: 2,
      name: 'Player2',
      wins: 3,
      reward: 500,
    },
    {
      ranking: 3,
      name: 'Player3',
      wins: 2,
      reward: 320,
    },
    {
      ranking: 4,
      name: 'Player4',
      wins: 2,
      reward: 320,
    },
    {
      ranking: 5,
      name: 'Player5',
      wins: 1,
      reward: 140,
    },
    {
      ranking: 6,
      name: 'Player6',
      wins: 1,
      reward: 140,
    },
    {
      ranking: 7,
      name: 'Player7',
      wins: 1,
      reward: 140,
    },
    {
      ranking: 8,
      name: 'Player8',
      wins: 1,
      reward: 140,
    },
    {
      ranking: 9,
      name: 'Player9',
      wins: 0,
      reward: 0,
    },
    {
      ranking: 10,
      name: 'Player10',
      wins: 0,
      reward: 0,
    },
  ];

  const coveyTownController = useTownController();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const closeLeaderboardModal = useCallback(() => {
    onClose();
    coveyTownController.unPause();
  }, [onClose, coveyTownController]);

  useEffect(() => {
    const downHandler = ({ key }: { key: any }) => {
      if (key === 'Shift') {
        if (coveyTownController.paused) {
          onClose();
          coveyTownController.unPause();
        } else {
          onOpen();
          coveyTownController.pause();
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
    columnHelper.accessor('reward', {
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
          <Button colorScheme='blue' mr={3} onClick={closeLeaderboardModal}>
            Done
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
