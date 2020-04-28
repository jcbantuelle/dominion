import { FlowRouter } from 'meteor/ostrio:flow-router-extra'

Template.approval.onCreated(registerStreams)

function registerStreams() {
  Streamy.on('account_approved', redirectToLobby)
}

function redirectToLobby(data) {
  FlowRouter.go(`/lobby`)
}