CardView = class CardView {

  static render(cards, hover = false) {
    if (_.isArray(cards)) {
      return CardView.card_list_html(cards, hover)
    } else if (_.isPlainObject(cards)) {
      let rendered_card = cards.top_card ? cards.top_card : cards
      return CardView.card_html(rendered_card.types, rendered_card.name, rendered_card.image, hover)
    } else {
      return CardView.card_html(cards.type_class(), cards.name(), cards.image(), hover)
    }
  }

  static card_list_html(cards, hover = false) {
    return _.map(cards, (card) => {
      return CardView.card_html(card.types, card.name, card.image, hover)
    }).join(' ')
  }

  static card_html(types, name, image, hover = false) {
    let rendered_html = `<span class="${types}">${name}</span>`
    if (hover) {
      let width = 220
      let height = 341
      types = _.words(types)
      if (_.includes(types, 'boon') || _.includes(types, 'state') || _.includes(types, 'hex')) {
        width = 341
        height = 220
      }
      rendered_html += `<div class="card-tooltip">
        <img src="${Meteor.settings.public.static.cards}${image}.jpg" width="${width}" height="${height}" />
      </div>`
    }
    return rendered_html
  }

}
