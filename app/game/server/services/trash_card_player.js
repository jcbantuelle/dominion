TrashCardPlayer = class TrashCardPlayer extends CardPlayer {

  play() {
    this.update_log()
    this.update_db()
    this.play_card()
    this.action_resolution_events()
    this.update_db()
  }

}
