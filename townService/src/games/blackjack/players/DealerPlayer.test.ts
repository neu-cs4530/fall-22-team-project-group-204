/* eslint-disable no-promise-executor-return */
/* eslint-disable prettier/prettier */

import Card from '../../cards/Card';
import CardFactory from '../../cards/CardFactory';
import Suit from '../../cards/Suit';
import Value from '../../cards/Value';
import BlackjackAction from '../blackjack/BlackjackAction';
import DealerPlayer from "./DealerPlayer";
import GameStatus from "./GameStatus";
import Hand from "./Hand";
import HumanPlayer from "./HumanPlayer";

// We are effectively testing both the DealerPlayer class and the
// Player class here
describe('DealerPlayer', () => {
  let dealerPlayer: DealerPlayer;
  let playerOne: HumanPlayer;
  let playerTwo: HumanPlayer;
  let players: HumanPlayer[];

  beforeEach(() => {
    dealerPlayer = new DealerPlayer(GameStatus.Waiting, '0');
    playerOne = new HumanPlayer(GameStatus.Waiting, '1');
    playerTwo = new HumanPlayer(GameStatus.Waiting, '2');
    players = [playerOne, playerTwo];
  });

  afterAll(done => {
    done();
  });

  describe('constructor', () => {
    it('Constructs a DealerPlayer properly', () => {
      // TODO: Remove these two expect statements (at very end)
      expect(players).toHaveLength(2);
      expect(dealerPlayer).toBeDefined();
      const newDealerPlayer = new DealerPlayer(GameStatus.Waiting, '0');
      expect(newDealerPlayer.status).toBe(GameStatus.Waiting);
      expect(newDealerPlayer.id).toBe('0');
    });
  });

  describe('doRound', () => {
    it('Does a round properly', async () => {
      expect(playerOne.hand.cards).toStrictEqual([]);
      expect(playerTwo.hand.cards).toStrictEqual([]);

      dealerPlayer.dealCards(players);

      dealerPlayer.advanceGame(players, '1', BlackjackAction.Hit);
      dealerPlayer.advanceGame(players, '2', BlackjackAction.Stay);

      const playerOneCards = playerOne.hand.cards;
      expect(playerOneCards).not.toStrictEqual([]);
      expect(playerOneCards.length === 2 || playerOneCards.length === 3).toBe(true);

      const playerTwoCards = playerTwo.hand.cards;
      expect(playerTwoCards).not.toStrictEqual([]);
      expect(playerTwoCards.length).toBe(2);
    });
  });


  describe('getters', () => {
    it('Status getter works correctly', () => {
      expect(dealerPlayer.status).toBe(GameStatus.Waiting);
    });

    it('Deck getter works properly', () => {
      expect(dealerPlayer.deck).not.toStrictEqual([]);
      expect(dealerPlayer.deck.length).toBe(312);
    });

    DealerPlayer.getDecks(2)
      .flat()
      .forEach((card, index) => {
        it(`Deck getter works correctly for card ${index}`, () => {
          expect(dealerPlayer.deck).toContain(card);
        });
      });

    it('Hand getter works properly', () => {
      expect(dealerPlayer.hand).toBeInstanceOf(Hand);
      expect(dealerPlayer.hand.cards).toStrictEqual([]);
    });

    it('id getter works properly', () => {
      expect(dealerPlayer.id).toBe('0');
    });
  });

  describe('setters', () => {
    it('Status setter works properly', () => {
      expect(dealerPlayer.status).toBe(GameStatus.Waiting);
      dealerPlayer.status = GameStatus.Playing;
      expect(dealerPlayer.status).toBe(GameStatus.Playing);
    });
    it('Hand setter works properly', () => {
      expect(dealerPlayer.hand).toBeInstanceOf(Hand);
      expect(dealerPlayer.hand.cards).toStrictEqual([]);
      const cards: [Card, boolean][] = [
        [CardFactory.getCard(Value.Ace, Suit.Diamonds), false],
        [CardFactory.getCard(Value.King, Suit.Diamonds), true],
      ];
      const newHand = new Hand(cards);
      dealerPlayer.hand = newHand;
      expect(dealerPlayer.hand).toBe(newHand);
      expect(dealerPlayer.hand.cards).toStrictEqual(cards);
    });
  });

  describe('class methods', () => {
    describe('shuffleDeck', () => {
      it('Shuffles a deck properly', () => {
        const deck = CardFactory.getDeck();
        const shuffledDeck = DealerPlayer.shuffleDeck(deck);
        expect(shuffledDeck).not.toStrictEqual(deck);
        expect(deck).toStrictEqual(CardFactory.getDeck());
        expect(shuffledDeck).toStrictEqual(expect.arrayContaining(deck));
      });
    });

    describe('shuffleDecks', () => {
      it('Shuffles the master deck properly', () => {
        const masterDeck = dealerPlayer.deck;
        dealerPlayer.shuffleDecks();
        expect(masterDeck).not.toStrictEqual(dealerPlayer.deck);
        expect(masterDeck).toStrictEqual(expect.arrayContaining(dealerPlayer.deck));
      });
    });

    describe('dealCards', () => {
      it('Deals a card properly', () => {
        const playerThree = new HumanPlayer(GameStatus.Waiting, '3');
        expect(playerThree.hand.cards).toStrictEqual([]);
        const playerFour = new HumanPlayer(GameStatus.Waiting, '4');
        expect(playerFour.hand.cards).toStrictEqual([]);

        dealerPlayer.dealCards([playerThree, playerFour]);

        const playerThreeCards = playerThree.hand.cards;
        expect(playerThreeCards).not.toStrictEqual([]);
        expect(playerThreeCards.length).toBe(2);

        const playerThreeFirstCard = playerThreeCards[0][0];
        const playerThreeFirstCardHidden = playerThreeCards[0][1];
        expect(playerThreeFirstCard).toBeInstanceOf(Card);
        expect(playerThreeFirstCardHidden).toBe(true);

        const playerThreeSecondCard = playerThreeCards[1][0];
        const playerThreeSecondCardHidden = playerThreeCards[1][1];
        expect(playerThreeSecondCard).toBeInstanceOf(Card);
        expect(playerThreeSecondCardHidden).toBe(true);

        const playerFourCards = playerFour.hand.cards;
        expect(playerFourCards).not.toStrictEqual([]);
        expect(playerFourCards.length).toBe(2);
        const playerFourFirstCard = playerFourCards[0][0];
        const playerFourFirstCardHidden = playerFourCards[0][1];
        expect(playerFourFirstCard).toBeInstanceOf(Card);
        expect(playerFourFirstCardHidden).toBe(true);

        const playerFourSecondCard = playerFourCards[1][0];
        const playerFourSecondCardHidden = playerFourCards[1][1];
        expect(playerFourSecondCard).toBeInstanceOf(Card);
        expect(playerFourSecondCardHidden).toBe(true);
      });
    });

    describe('updateDealer', () => {
      it('updates the dealer with new dealer', () => {
        dealerPlayer = new DealerPlayer(GameStatus.Waiting, '0');
        const dealerPlayer2 = new DealerPlayer(GameStatus.Playing, '1');
        const cards: [Card, boolean][] = [
          [CardFactory.getCard(Value.Ace, Suit.Diamonds), false],
          [CardFactory.getCard(Value.King, Suit.Diamonds), true],
        ];
        const cards2: [Card, boolean][] = [
          [CardFactory.getCard(Value.Three, Suit.Diamonds), false],
          [CardFactory.getCard(Value.Ace, Suit.Diamonds), true],
        ];
        const newHand = new Hand(cards);
        const newHand2 = new Hand(cards2);
        dealerPlayer.hand = newHand;
        dealerPlayer2.hand = newHand2;
        expect(dealerPlayer.hand).toStrictEqual(newHand);
        expect(dealerPlayer.status).toBe(GameStatus.Waiting);

        dealerPlayer.updateDealer(dealerPlayer2);

        expect(dealerPlayer.hand).toStrictEqual(newHand2);
        expect(dealerPlayer.status).toBe(GameStatus.Playing);

      });
    });
  });

  describe('static methods', () => {
    describe('getDecks', () => {
      it('Returns an array of decks', () => {
        const decks = DealerPlayer.getDecks(2);
        expect(decks).toStrictEqual([CardFactory.getDeck(), CardFactory.getDeck()]);

        expect(DealerPlayer.getDecks(5)).toStrictEqual([
          CardFactory.getDeck(),
          CardFactory.getDeck(),
          CardFactory.getDeck(),
          CardFactory.getDeck(),
          CardFactory.getDeck(),
        ]);
      });
    });
  });
});
