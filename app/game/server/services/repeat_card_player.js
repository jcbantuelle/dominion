RepeatCardPlayer = class RepeatCardPlayer extends CardPlayer {

  play(times) {
    this.put_card_in_play()
    let card_play_list = _.times(times, (count) => {
      return Meteor.bindEnvironment(this.play_once.bind(this))
    })

    _.reduce(_.rest(card_play_list), (chain, card_play_action) => {
      return chain.then(card_play_action)
    }, _.first(card_play_list)())
  }

  play_once() {
    this.update()
    return this.play_card()
  }

}
