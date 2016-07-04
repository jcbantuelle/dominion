Meteor.methods({
  approveAccount: function(player_id) {
    if (Meteor.user().admin) {
      Meteor.users.update(player_id, {$set: {approved: true}})
    }
  },
  unapproveAccount: function(player_id) {
    if (Meteor.user().admin) {
      Meteor.users.update(player_id, {$unset: {approved: ''}})
    }
  },
  disableAccount: function(player_id) {
    if (Meteor.user().admin) {
      Meteor.users.update(player_id, {$set: {disabled: true}})
    }
  },
  enableAccount: function(player_id) {
    if (Meteor.user().admin) {
      Meteor.users.update(player_id, {$unset: {disabled: ''}})
    }
  }
})

