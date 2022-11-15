import {
  Box,
  Button,
  IconButton,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useInteractable, useGamingAreaController } from '../../../classes/TownController';
import useTownController from '../../../hooks/useTownController';
import GamingAreaController from '../../../classes/GamingAreaController';
import GamingArea from './GamingArea';
import { Card } from '../../../types/CoveyTownSocket';

// i need to figure out how the back and front end communicate :C

// import Value, { getValueNumbers } from '../../../../../townService/src/games/cards/Value';
// import Suit from '../../../../../townService/src/games/cards/Suit';

function cardToId(card: Card): number {
  const value = card.value;
  const suit = card.suit;
  const valueMap = new Map<string, number>([
    ['Ace', 13],
    ['King', 12],
    ['Queen', 11],
    ['Jack', 10],
    ['Ten', 9],
    ['Nine', 8],
    ['Eight', 7],
    ['Seven', 6],
    ['Six', 5],
    ['Five', 4],
    ['Four', 3],
    ['Three', 2],
    ['Two', 1],
  ]);

  const cardValueId = valueMap.get(value);
  let cardId: number;
  if (cardValueId) {
    switch (suit) {
      case 'Spades':
        cardId = cardValueId;
        break;
      case 'Clubs':
        cardId = cardValueId + 13;
        break;
      case 'Diamonds':
        cardId = cardValueId + 26;
        break;
      case 'Hearts':
        cardId = cardValueId + 39;
        break;
      default:
        cardId = -1;
        break;
    }
    return cardId;
  }
  throw new Error('Value not found in table');
}

// export function Card({ value, suit }: { value: Value; suit: Suit }) {
//   let cardValueId: number;
//   switch (value) {
//     case Value.Ace:
//       cardValueId = 13;
//       break;
//     case Value.King:
//       cardValueId = 12;
//       break;
//     case Value.Queen:
//       cardValueId = 11;
//       break;
//     case Value.Jack:
//       cardValueId = 10;
//       break;
//     default:
//       cardValueId = getValueNumbers(value)[0] - 1;
//       break;
//   }
//   let cardId: number;
//   switch (suit) {
//     case Suit.Spades:
//       cardId = cardValueId;
//       break;
//     case Suit.Clubs:
//       cardId = cardValueId + 13;
//       break;
//     case Suit.Diamonds:
//       cardId = cardValueId + 26;
//       break;
//     case Suit.Hearts:
//       cardId = cardValueId + 39;
//       break;
//   }
//   const cardIdString = ('0' + cardId).slice(-2);
//   const card = `assets/blackjack/playingcards/playingcards_${cardIdString}.png`;
//   return <Image src={card} />;
// }

export function PlayingCard({ cardId, x, y }: { cardId: number; x: number; y: number }) {
  const cardIdString = ('0' + cardId).slice(-2);
  const card = `assets/blackjack/playingcards/playingcards_${cardIdString}.png`;
  return <Image width='64px' position='absolute' src={card} top={y + 'px'} left={x + 'px'} />;
}


export function Chip({ chipValue, x, y }: { chipValue: number; x: number; y: number }) {
  const chip = `assets/blackjack/chips/chip_${chipValue}.png`;
  return (
    <IconButton
      variant='ghost'
      position='relative'
      colorScheme='ghost'
      // _focus={{ boxShadow: 'none' }} # do we want box shadow when clicking chips?
      top={y + 'px'}
      left={x + 'px'}
      icon={<Image width='40px' src={chip} />}
      aria-label={''}
    />
  );
}

export function Blackjack({ controller }: { controller: GamingAreaController }) {
  const townController = useTownController();
  const [dealerHand, setDealerHand] = useState<Card[]>(controller.dealerHand);
  useEffect(() => {
    console.log(controller.id);
  });

  useEffect(() => {
    const setNewDealerHand = (hand: Card[]) => {
      setDealerHand(hand);
    };
    controller.addListener('dealerHandChange', setNewDealerHand);
    return () => {
      controller.removeListener('dealerHandChange', setNewDealerHand);
    };
  }, [controller, townController]);

  const hit = () => {
    controller.advanceTurn(townController.userID, true);
  };

  return (
    <Box
      backgroundImage='assets/blackjack/blackjack_background.jpg'
      width='960px'
      height='600px'
      backgroundRepeat='no-repeat'
      backgroundSize='cover'
      position='relative'>
      <Button size='sm' left='200px' top='500px' colorScheme='gray' position='relative'>
        Hit
      </Button>
      <Button size='sm' left='240px' top='500px' colorScheme='gray' position='relative'>
        Stand
      </Button>
      <Card cardId={33} x={450} y={400} />
      <Card cardId={22} x={470} y={425} />
      <Chip chipValue={1} x={510} y={480} />
      <Chip chipValue={5} x={540} y={480} />
      <Chip chipValue={25} x={570} y={480} />
      <Chip chipValue={100} x={600} y={480} />
      <Chip chipValue={500} x={630} y={480} />
      <Text as='b' fontSize='md' left='325px' top='450px' position='relative'>
        1
      </Text>
      <Text as='b' fontSize='md' left='385px' top='450px' position='relative'>
        5
      </Text>
      <Text as='b' fontSize='md' left='440px' top='450px' position='relative'>
        25
      </Text>
      <Text as='b' fontSize='md' left='485px' top='450px' position='relative'>
        100
      </Text>
      <Text as='b' fontSize='md' left='525px' top='450px' position='relative'>
        500
      </Text>
      <Button size='sm' left='350px' top='535px' colorScheme='gray' position='relative'>
        Bet
      </Button>
    </Box>
  );
}

export function BlackjackModal({ gamingArea }: { gamingArea: GamingArea }): JSX.Element {
  const coveyTownController = useTownController();
  const gamingAreaController = useGamingAreaController(gamingArea.name);

  const [isOpen, setIsOpen] = useState<boolean>(gamingArea !== undefined);

  useEffect(() => {
    if (isOpen) {
      coveyTownController.pause();
    } else {
      coveyTownController.unPause();
    }
  }, [coveyTownController, isOpen]);

  const closeModal = useCallback(() => {
    coveyTownController.unPause();
    setIsOpen(false);
  }, [coveyTownController, setIsOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        closeModal();
        coveyTownController.unPause();
      }}
      size='5xl'>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Blackjack!</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Blackjack controller={gamingAreaController} />
        </ModalBody>
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

export default function BlackjackWrapper(): JSX.Element {
  const gamingArea = useInteractable<GamingArea>('gamingArea');
  if (gamingArea) {
    return <BlackjackModal gamingArea={gamingArea} />;
  }
  return <></>;
}
