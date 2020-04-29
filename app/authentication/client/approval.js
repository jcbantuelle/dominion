import { FlowRouter } from 'meteor/ostrio:flow-router-extra'

Template.approval.onCreated(function () {
  Streamy.on('account_approved', function() {
    FlowRouter.go(`/lobby`)
  })
})