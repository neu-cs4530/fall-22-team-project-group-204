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

  public getNumericScores(): number[] {
    const scores: number[] = [0];
    // need to figure out a better name than cardInfo

    this._cards.forEach(cardInfo => {
      const values = cardInfo[0].getNumericValue();
      const scoresCopy = new Array<number>(...scores);
      const valueOne = values[0];

      scores.map(score => score + valueOne);

      if (values.length === 2) {
        const valueTwo = values[1];
        scoresCopy.map(score => score + valueTwo);
        scores.push(...scoresCopy);
      }
    });
    return scores;
  }

  constructor(cards: [Card, boolean][] = []) {
    this._cards = cards;
  }
}
