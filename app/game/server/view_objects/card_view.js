CardView = class CardView {

  static render(cards) {
    if (_.isArray(cards)) {
      return CardView.card_list_html(cards)
    } else if (_.isPlainObject(cards)) {
      let rendered_card = cards.top_card ? cards.top_card : cards
      return CardView.card_html(rendered_card.types, rendered_card.name, rendered_card.image)
    } else {
      return CardView.card_html(cards.type_class(), cards.name(), cards.image())
    }
  }

  static card_list_html(cards) {
    return _.map(cards, (card) => {
      return CardView.card_html(card.types, card.name, card.image)
    }).join(' ')
  }

  static card_html(types, name, image) {
    let rendered_html = `<span class="${types} card">${name}</span>`

    let width = 220
    let height = 341
    types = _.words(types)
    if (_.includes(types, 'boon') || _.includes(types, 'state') || _.includes(types, 'hex') || _.includes(types, 'artifact') || _.includes(types, 'event') || _.includes(types, 'landmark')) {
      width = 341
      height = 220
    }

    if (_.isNil(image)) {
      image = _.snakeCase(name)
    }

    rendered_html += `<div class="card-tooltip">
      <img src="${Meteor.settings.public.static.cards}${image}.jpg" width="${width}" height="${height}" />
    </div>`

    return rendered_html
  }

}
