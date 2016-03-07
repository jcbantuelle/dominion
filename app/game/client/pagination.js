Template.pagination.helpers({
  previous_page: function (page_name) {
    return pageShift(page_name, -1)
  },
  next_page: function (page_name) {
    return pageShift(page_name, 1)
  }
})

Template.pagination.events({
  "click .pagination span": changePage
})

function pageShift (page_name, shift) {
  let new_page = parseInt(Session.get(page_name)) + shift
  let max_page = _.ceil(Counts.get('game_history_count') / Pagination.per_page)
  let min_page = 1
  return (new_page < min_page || new_page > max_page) ? (new_page - shift) : new_page
}

function changePage(event) {
  let page_name = $(event.target).attr('data-page-name')
  let page_number = $(event.target).attr('data-page')
  Session.set(page_name, page_number)
}
