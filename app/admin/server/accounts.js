Meteor.methods({
  approveAccount: function(player_id) {
    if (Meteor.user().admin) {
      Meteor.users.update(player_id, {$set: {approved: true}})
      Streamy.sessionsForUsers([player_id]).emit('account_approved', {})
    }
  },
  unapproveAccount: function(player_id) {
    if (Meteor.user().admin) {
      Meteor.users.update(player_id, {$unset: {approved: ''}})
    }
    Streamy.sessionsForUsers([player_id]).emit('account_inactivated', {})
  },
  disableAccount: function(player_id) {
    if (Meteor.user().admin) {
      Meteor.users.update(player_id, {$set: {disabled: true}})
    }
    Streamy.sessionsForUsers([player_id]).emit('account_inactivated', {})
  },
  enableAccount: function(player_id) {
    if (Meteor.user().admin) {
      Meteor.users.update(player_id, {$unset: {disabled: ''}})
    }
    Streamy.sessionsForUsers([player_id]).emit('account_approved', {})
  }
})

