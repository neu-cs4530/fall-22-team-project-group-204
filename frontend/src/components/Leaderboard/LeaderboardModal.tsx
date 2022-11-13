import {
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Table,
  TableContainer,
  Tbody,
  Td,
  Tfoot,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import useTownController from '../../hooks/useTownController';

export default function LeaderboardModal(): JSX.Element {
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

  return (
    <Modal
      size='xl'
      isOpen={showModal}
      onClose={() => {
        closeModal();
      }}
      scrollBehavior='inside'>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Blackjack Leaderboard</ModalHeader>
        <TableContainer overflowY='scroll'>
          <Table variant='simple' size='lg'>
            <Thead>
              <Tr>
                <Th isNumeric>Ranking</Th>
                <Th>Name</Th>
                <Th isNumeric>Wins</Th>
                <Th isNumeric>Rewards</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td isNumeric>1</Td>
                <Td>Player1</Td>
                <Td isNumeric>6</Td>
                <Td isNumeric>400</Td>
              </Tr>
              <Tr>
                <Td isNumeric>2</Td>
                <Td>Player2</Td>
                <Td isNumeric>3</Td>
                <Td isNumeric>500</Td>
              </Tr>
              <Tr>
                <Td isNumeric>3</Td>
                <Td>Player3</Td>
                <Td isNumeric>2</Td>
                <Td isNumeric>320</Td>
              </Tr>
              <Tr>
                <Td isNumeric>4</Td>
                <Td>Player4</Td>
                <Td isNumeric>2</Td>
                <Td isNumeric>320</Td>
              </Tr>
              <Tr>
                <Td isNumeric>5</Td>
                <Td>Player5</Td>
                <Td isNumeric>1</Td>
                <Td isNumeric>140</Td>
              </Tr>
              <Tr>
                <Td isNumeric>6</Td>
                <Td>Player6</Td>
                <Td isNumeric>1</Td>
                <Td isNumeric>140</Td>
              </Tr>
              <Tr>
                <Td isNumeric>7</Td>
                <Td>Player7</Td>
                <Td isNumeric>1</Td>
                <Td isNumeric>140</Td>
              </Tr>
              <Tr>
                <Td isNumeric>8</Td>
                <Td>Player8</Td>
                <Td isNumeric>1</Td>
                <Td isNumeric>140</Td>
              </Tr>
            </Tbody>
            <Tfoot>
              <Tr>
                <Th isNumeric>Ranking</Th>
                <Th>Name</Th>
                <Th isNumeric>Wins</Th>
                <Th isNumeric>Rewards</Th>
              </Tr>
            </Tfoot>
          </Table>
        </TableContainer>
        <ModalFooter>
          <Button colorScheme='blue' mr={3} onClick={closeModal}>
            Done
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
