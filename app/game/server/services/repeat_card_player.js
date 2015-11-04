RepeatCardPlayer = class RepeatCardPlayer extends CardPlayer {

  play(times) {
    this.put_card_in_play()
    let card_play_list = _.times(times, (count) => {
      this.play_once()
    })
  }

  play_once() {
    this.update_log()
    this.update_db()
    return this.play_card()
  }

}
