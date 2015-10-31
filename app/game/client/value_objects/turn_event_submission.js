TurnEventSubmission = class TurnEventSubmission {

  constructor(turn_event, selected_checkboxes) {
    this.turn_event = turn_event
    this.selected_checkboxes = selected_checkboxes
  }

  valid_selection() {
    if (this.turn_event.maximum > 0 && this.selected_checkboxes.length > this.turn_event.maximum) {
      this.error = `You can select no more than ${this.turn_event.maximum} card(s)`
    } else if (this.turn_event.minimum > 0 && this.selected_checkboxes.length < this.turn_event.minimum) {
      this.error = `You must select at least ${this.turn_event.minimum} card(s)`
    }
    return this.error === undefined
  }

  selected_values() {
    if (this.turn_event.type === 'choose_yes_no') {
      return this.yes_no_selection()
    } else if (this.turn_event.type === 'choose_cards') {
      return this.card_selection()
    }
  }

  yes_no_selection() {
    return this.selected_checkboxes.first().val()
  }

  card_selection() {
    let turn_event = this.turn_event
    return this.selected_checkboxes.map(function() {
      let card_name = $(this).val()
      return _.find(turn_event.cards, function(card) {
        return card.name === card_name
      })
    }).get()
  }

  error_message() {
    return this.error
  }

}
