GameProposer = class GameProposer {

  constructor(player_ids, exclusions) {
    this.players = this.find_players(player_ids)
    this.exclusions = exclusions
  }

  propose(kingdom_id) {
    if (typeof kingdom_id === 'undefined') {
      this.select_cards()
      this.proposal_id = this.create_proposal()
      this.update_players()
      this.set_proposal_timeout()
    } else {
      try {
        this.select_cards_from_kingdom(kingdom_id)
        this.proposal_id = this.create_proposal()
        this.update_players()
        this.set_proposal_timeout()
      } catch(e) {
        _.each(this.players, function(player) {
          Meteor.users.update(player._id, {
            $unset: {has_proposal: ''},
            $set: {declined_proposal: 'Wrong kingdom id!'}
          })
        })
      }
    }
  }

  create_proposal(proposal_cards) {
    return ProposalModel.insert({
      proposer: {
        id: Meteor.userId(),
        username: Meteor.user().username
      },
      players: this.players,
      cards: this.cards,
      exclusions: this.exclusions
    })
  }

  select_cards() {
    card_list = new CardList(this.exclusions)
    this.cards = card_list.pull_set()
  }

  select_cards_from_kingdom(kingdom_id) {
    card_list = new CardList()
    this.cards = card_list.pull_from_history(kingdom_id)


  }

  update_players() {
    _.each(this.players, function(player) {
      Meteor.users.update(player._id, {
        $set: {has_proposal: true},
        $unset: {declined_proposal: ''}
      })
    })
  }

  set_proposal_timeout() {
    Meteor.setTimeout(() => {
      if (ProposalModel.findOne(this.proposal_id)) {
        let proposal_decliner = new ProposalDecliner(this.proposal_id)
        proposal_decliner.timeout_decline()
      }
    }, 30000)
  }

  find_players(player_ids) {
    player_ids.push(Meteor.userId())
    return Meteor.users.find({_id: {$in: player_ids}}).fetch()
  }
}
