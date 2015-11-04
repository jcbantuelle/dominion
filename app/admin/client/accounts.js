Template.accounts.events({
  "click .btn-success": approveAccount,
  "click .btn-danger": unapproveAccount
})

function approveAccount(event) {
  event.preventDefault()
  Meteor.call('approveAccount', event.target.id)
}

function unapproveAccount(event) {
  event.preventDefault()
  Meteor.call('unapproveAccount', event.target.id)
}
