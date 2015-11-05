RepeatCardPlayer = class RepeatCardPlayer extends CardPlayer {

  play(times, source) {
    this.put_card_in_play()
    let play_results = this.play_multiple_times(times)
    let duration_count = _.size(this.duration_plays(play_results))
    if (duration_count > 0) {
      this.mark_played_card_as_duration(duration_count)
      if (duration_count > 1) {
        this.mark_source_as_duration(source)
      }
    }
    this.resolve_played_cards()
    this.update_db()
  }

  play_multiple_times(times) {
    return _.times(times, (count) => {
      return this.play_once()
    })
  }

  duration_plays(play_results) {
    return _.filter(play_results, function(result) {
      return result === 'duration'
    })
  }

  mark_source_as_duration(source) {
    let source_card_index = _.findIndex(this.player_cards.playing, function(card) {
      return card.name === source && !card.processed
    })
    this.player_cards.playing[source_card_index].destination = 'duration'
    this.player_cards.playing[source_card_index].processed = true
  }

  play_once() {
    this.update_log()
    this.update_db()
    return this.play_card()
  }

}
