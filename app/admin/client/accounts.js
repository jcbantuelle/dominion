Template.accounts.events({
  "click .approve": approveAccount,
  "click .unapprove": unapproveAccount,
  "click .disable": disableAccount,
  "click .enable": enableAccount
})

function approveAccount(event) {
  event.preventDefault()
  Meteor.call('approveAccount', $(event.target).attr('data-player-id'))
}

function unapproveAccount(event) {
  event.preventDefault()
  Meteor.call('unapproveAccount', $(event.target).attr('data-player-id'))
}

function disableAccount(event) {
  event.preventDefault()
  Meteor.call('disableAccount', $(event.target).attr('data-player-id'))
}

function enableAccount(event) {
  event.preventDefault()
  Meteor.call('enableAccount', $(event.target).attr('data-player-id'))
}
