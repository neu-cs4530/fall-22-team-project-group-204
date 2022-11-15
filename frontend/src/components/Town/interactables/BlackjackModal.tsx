import {
  Button,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';
import React, { useCallback, useEffect } from 'react';
import { useInteractable } from '../../../classes/TownController';
import useTownController from '../../../hooks/useTownController';

export default function BlackjackModal(): JSX.Element {
  const coveyTownController = useTownController();
  const newBlackjack = useInteractable('gamingArea');

  const isOpen = newBlackjack !== undefined;

  useEffect(() => {
    if (newBlackjack) {
      coveyTownController.pause();
    } else {
      coveyTownController.unPause();
    }
  }, [coveyTownController, newBlackjack]);

  const closeModal = useCallback(() => {
    if (newBlackjack) {
      coveyTownController.interactEnd(newBlackjack);
    }
  }, [coveyTownController, newBlackjack]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        closeModal();
        coveyTownController.unPause();
      }}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>BLACKJACK PLACEHOLDER</ModalHeader>
        <ModalCloseButton />
        <ModalFooter>
          <Button colorScheme='blue' mr={3} onClick={closeModal}>
            Done
          </Button>
          <Button onClick={closeModal}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
