import { FlowRouter } from 'meteor/ostrio:flow-router-extra'

Template.pagination.helpers({
  previous_page: function () {
    return current_page() - 1
  },
  next_page: function () {
    return current_page() + 1
  },
  show_previous_page: function () {
    return current_page() != 1
  },
  show_next_page: function() {
    return current_page() != _.ceil(Counts.get('game_history_count') / Pagination.per_page)
  },
  is_current_page: function(page_number) {
    return page_number === current_page()
  }
})

function current_page() {
  let page_param = FlowRouter.getQueryParam('page')
  return page_param ? parseInt(page_param) : 1
}