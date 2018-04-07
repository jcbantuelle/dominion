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
      let width = _.includes(_.words(types), 'boon') || _.includes(_.words(types), 'state') ? 341 : 220
      let height = _.includes(_.words(types), 'boon') || _.includes(_.words(types), 'state') ? 220 : 341
      rendered_html += `<div class="card-tooltip">
        <img src="${Meteor.settings.public.static.cards}${image}.jpg" width="${width}" height="${height}" />
      </div>`
    }
    return rendered_html
  }

}
