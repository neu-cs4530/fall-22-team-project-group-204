import Card from '../../cards/Card';

export default class Hand {
  // remind me to explain why i did it this way
  private _cards: [Card, boolean][];

  public get cards(): [Card, boolean][] {
    // there is most certainly a better way to do this
    return this._cards;
  }

  public set cards(value: [Card, boolean][]) {
    this._cards = value;
  }

  public addCard(card: Card, isFaceUp = true): void {
    this._cards.push([card, isFaceUp]);
  }

  public getNumericScores(): number[] {
    let scores: number[] = [0];
    // need to figure out a better name than cardInfo

    for (const cardInfo of this._cards) {
      const values = cardInfo[0].getNumericValue();
      let scoresCopy = [...scores];
      const valueOne = values[0];

      scores = scores.map(score => score + valueOne);

      if (values.length === 2) {
        const valueTwo = values[1];
        scoresCopy = scoresCopy.map(score => score + valueTwo);
        scores.push(...scoresCopy);
      }
    }

    return scores.filter((item, index) => scores.indexOf(item) === index);
  }

  constructor(cards: [Card, boolean][] = []) {
    this._cards = cards;
  }
}
