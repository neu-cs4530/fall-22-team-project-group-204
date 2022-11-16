/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Modal, ModalContent, ModalFooter, ModalHeader } from '@chakra-ui/react';
import { createColumnHelper } from '@tanstack/react-table';
import React, { useEffect, useState } from 'react';
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
  // State for keeping track of whether key is pressed
  const [showModal, setShowModal] = useState<boolean>(false);

  // If released key is our target key then set to false
  const closeModal = () => {
    setShowModal(false);
    coveyTownController.unPause();
  };

  useEffect(() => {
    const downHandler = ({ key }: { key: any }) => {
      if (key === 'Shift') {
        setShowModal(!showModal);
        if (coveyTownController.paused) {
          coveyTownController.unPause();
        } else {
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
      meta: {
        isNumeric: true,
      },
    }),
    columnHelper.accessor('name', {
      cell: info => info.getValue(),
      header: 'Name',
    }),
    columnHelper.accessor('wins', {
      cell: info => info.getValue(),
      header: 'Wins',
      meta: {
        isNumeric: true,
      },
    }),
    columnHelper.accessor('reward', {
      cell: info => info.getValue(),
      header: 'Reward',
      meta: {
        isNumeric: true,
      },
    }),
  ];

  return (
    <Modal
      size='xl'
      isOpen={showModal}
      onClose={() => {
        closeModal();
      }}
      scrollBehavior='inside'>
      <ModalContent>
        <ModalHeader>Blackjack Leaderboard</ModalHeader>
        <DataTable columns={columns} data={data} />
        <ModalFooter>
          <Button colorScheme='blue' mr={3} onClick={closeModal}>
            Done
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
