CardView = class CardView {

  static render(cards) {
    if (_.isArray(cards)) {
      return CardView.card_list_html(cards)
    } else if (_.isPlainObject(cards)) {
      return CardView.card_html(cards.types, cards.name)
    } else {
      return CardView.card_html(cards.type_class(), cards.name())
    }
  }

  static card_list_html(cards) {
    return _.map(cards, (card) => {
      return CardView.card_html(card.types, card.name)
    }).join(' ')
  }

  static card_html(types, name) {
    return `<span class="${types}">${name}</span>`
  }

}
