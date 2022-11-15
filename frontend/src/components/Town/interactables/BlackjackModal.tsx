/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Box,
  Button,
  Container,
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
import { PlayingCard } from '../../../types/CoveyTownSocket';

// i need to figure out how the back and front end communicate :C

// import Value, { getValueNumbers } from '../../../../../townService/src/games/cards/Value';
// import Suit from '../../../../../townService/src/games/cards/Suit';

function cardToId(card: PlayingCard): number {
  const value = card.value;
  const suit = card.suit;
  const valueMap = new Map<string, number>([
    ['A', 13],
    ['K', 12],
    ['Q', 11],
    ['J', 10],
    ['10', 9],
    ['9', 8],
    ['8', 7],
    ['7', 6],
    ['6', 5],
    ['5', 4],
    ['4', 3],
    ['3', 2],
    ['2', 1],
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
  throw new Error('Value not found in table: ' + value);
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

export function PlayingCardImage({ cardId, x, y }: { cardId: number; x: number; y: number }) {
  const cardIdString = ('0' + cardId).slice(-2);
  const card = `assets/blackjack/playingcards/playingcards_${cardIdString}.png`;
  return <Image width='64px' position='absolute' src={card} top={y + 'px'} left={x + 'px'} />;
}

export function Hand({ cards, x, y }: { cards: PlayingCard[]; x: number; y: number }) {
  const hand = cards.map((card, index) => {
    return (
      <PlayingCardImage key={index} cardId={cardToId(card)} x={x + index * 25} y={y + index * 25} />
    );
  });
  return (
    <Container>
      <Image position='absolute' src='assets/blackjack/marker.png' top={y} left={x} width='50px' />
      {hand}
    </Container>
  );
}

export function Chip({ chipValue, x, y }: { chipValue: number; x: number; y: number }) {
  const chip = `assets/blackjack/chips/chip_${chipValue}.png`;
  return (
    <IconButton
      variant='ghost'
      position='absolute'
      colorScheme='ghost'
      // _focus={{ boxShadow: 'none' }} # do we want box shadow when clicking chips?
      top={y + 'px'}
      left={x + 'px'}
      icon={<Image width='40px' src={chip} />}
      aria-label={''}
    />
  );
}

export function JoinLeaveButton({ joinLeaveFunc }: { joinLeaveFunc: () => void }) {
  const [joinLeave, setJoinLeave] = useState<boolean>(true);

  if (joinLeave) {
    return (
      <Button
        size='sm'
        left='50px'
        top='50px'
        colorScheme='gray'
        position='absolute'
        onClick={() => {
          setJoinLeave(false);
          joinLeaveFunc();
        }}>
        Join
      </Button>
    );
  } else {
    return (
      <Button
        size='sm'
        left='50px'
        top='50px'
        colorScheme='gray'
        position='absolute'
        onClick={() => {
          setJoinLeave(true);
          joinLeaveFunc();
        }}>
        Leave
      </Button>
    );
  }
}

export function Blackjack({ controller }: { controller: GamingAreaController }) {
  const townController = useTownController();
  const [dealerHand, setDealerHand] = useState<PlayingCard[]>(controller.dealerHand);
  useEffect(() => {
    console.log(controller.id);
  });

  useEffect(() => {
    const setNewDealerHand = (hand: PlayingCard[]) => {
      setDealerHand(hand);
    };
    controller.addListener('dealerHandChange', setNewDealerHand);
    return () => {
      controller.removeListener('dealerHandChange', setNewDealerHand);
    };
  }, [controller, townController]);

  townController.emitGamingAreaUpdate(controller);
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
      <JoinLeaveButton
        joinLeaveFunc={() => {
          controller.toggleJoinGame(townController.userID);
          townController.emitGamingAreaUpdate(controller);
        }}
      />
      <Button
        size='sm'
        left='200px'
        top='500px'
        colorScheme='gray'
        position='relative'
        onClick={() => {
          hit();
          townController.emitGamingAreaUpdate(controller);
        }}>
        Hit
      </Button>
      <Button size='sm' left='240px' top='500px' colorScheme='gray' position='relative'>
        Stand
      </Button>
      <Hand
        cards={[
          { value: '7', suit: 'Clubs' },
          { value: 'A', suit: 'Spades' },
        ]}
        x={450}
        y={400}
      />
      <Hand cards={dealerHand} x={450} y={100} />
      <Hand cards={[]} x={100} y={175} />
      <Hand cards={[]} x={100} y={325} />
      <Hand cards={[]} x={860} y={175} />
      <Hand cards={[]} x={860} y={325} />
      <Chip chipValue={1} x={600} y={480} />
      <Chip chipValue={5} x={650} y={480} />
      <Chip chipValue={25} x={700} y={480} />
      <Chip chipValue={100} x={750} y={480} />
      <Chip chipValue={500} x={800} y={480} />
      <Text as='b' fontSize='md' left='615px' top='450px' position='absolute'>
        1
      </Text>
      <Text as='b' fontSize='md' left='665px' top='450px' position='absolute'>
        5
      </Text>
      <Text as='b' fontSize='md' left='710px' top='450px' position='absolute'>
        25
      </Text>
      <Text as='b' fontSize='md' left='755px' top='450px' position='absolute'>
        100
      </Text>
      <Text as='b' fontSize='md' left='805px' top='450px' position='absolute'>
        500
      </Text>
      <Button size='sm' left='697px' top='535px' colorScheme='gray' position='absolute'>
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
