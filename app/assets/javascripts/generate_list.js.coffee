# Place all the behaviors and hooks related to the matching controller here.
# All this logic will automatically be available in application.js.
# You can use CoffeeScript in this file: http://coffeescript.org/
jQuery ->
  $('#import-data-button').on 'click', (event) ->
    console.log("IMPORTING")
    data = new FormData()
    data.append( 'file', $('#data_file')[0].files[0] )
    $.ajax
      url: '/generate_list/csv'
      data: data
      cache: false
      contentType: false
      processData: false
      type: 'POST'
      success: (data) ->
        console.log("SUCCESS")
        Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, data.documentElement)
    $('#import-data-dialog').modal('hide')
