Tasks = new Mongo.Collection("tasks")

if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish("tasks", function () {
    return Tasks.find({
      $or: [
        { private: {$ne: true} },
        { owner: this.userId }
      ]
    })
  })
}

if (Meteor.isClient) {

  Meteor.subscribe("tasks")

  function incompleteTaskFilter() {
    return {checked: {$ne: true}}
  }

  // This code only runs on the client
  Template.body.helpers({
    tasks: function() {
      let filter = Session.get("hideCompleted") ? incompleteTaskFilter() : {}
      return Tasks.find(filter, {sort: {createdAt: -1}})
    },
    hideCompleted: function () {
      return Session.get("hideCompleted")
    },
    incompleteCount: function () {
      return Tasks.find(incompleteTaskFilter()).count()
    }
  })

  Template.body.events({
    "submit .new-task": function(event) {
      // Prevent default browser form submit
      event.preventDefault()

      // Get value from form element
      let text = event.target.text.value

      Meteor.call("addTask", text)

      // Clear form
      event.target.text.value = ""
    },
    "change .hide-completed input": function (event) {
      Session.set("hideCompleted", event.target.checked);
    }
  })

  Template.task.helpers({
    isOwner: function () {
      return this.owner === Meteor.userId()
    }
  })

  Template.task.events({
    "click .toggle-checked": function () {
      Meteor.call("setChecked", this._id, !this.checked)
    },
    "click .delete": function () {
      Meteor.call("deleteTask", this._id)
    },
    "click .toggle-private": function () {
      Meteor.call("setPrivate", this._id, !this.private)
    }
  })

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  })
}

Meteor.methods({
  addTask: function (text) {
    // Make sure the user is logged in before inserting a task
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized")
    }

    Tasks.insert({
      text: text,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username
    })
  },
  deleteTask: function (taskId) {
    if (isTaskOwner(taskId)) {
      Tasks.remove(taskId)
    }
  },
  setChecked: function (taskId, setChecked) {
    if (isTaskOwner(taskId)) {
      Tasks.update(taskId, { $set: { checked: setChecked} })
    }
  },
  setPrivate: function (taskId, setToPrivate) {
    if (isTaskOwner(taskId)) {
      Tasks.update(taskId, { $set: { private: setToPrivate } })
    }
  }

})

function isTaskOwner(taskId) {
  let task = Tasks.findOne(taskId)

  if (task.owner !== Meteor.userId()) {
    throw new Meteor.Error("not-authorized")
  }
  return true
}
