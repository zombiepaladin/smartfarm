jQuery ->
  editor = $('#crop-editor')
  if(editor.length > 0)
    editor.height($(window).height() - 120);
    Blockly.inject(document.getElementById('crop-editor'), {
      path: '/assets/blockly/', 
      toolbox: document.getElementById('toolbox')
    })
    Blockly.Xml.domToWorkspace(
      Blockly.mainWorkspace, 
      document.getElementById('workspace')
    )

    msg = $('#message');
    Blockly.addChangeListener () ->
      msg.text("Changed...")
    callback = -> msg.text("")
    setTimeout callback, 100

    saveButton = $('button#save');
    saveButton.on 'click', () ->
      xml = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace)
      xml.id = "workspace"
      xml.setAttribute("style", "display: none")
      xmlText = Blockly.Xml.domToText(xml);
      code = Blockly.JavaScript.workspaceToCode()
      msg.text("Saving...")
      $.ajax "/crops/#{editor.data('crop-id')}", 
        method: "PUT"
        #contentType: "JSON"
        data: 
          crop: 
            workspace: xmlText
            code: code
        success: (response) ->
          msg.text(response)
        error: (jXHR, status, err) ->
          msg.text(err);
      

    runButton = $('button#run');
    runButton.on 'click', () ->
      
      # load code
      eval Blockly.JavaScript.workspaceToCode()
      console.log "LOADED CODE"

      # before water & nutrients
      if typeof before_water_and_nutrient_allocation == 'function'
        before_water_and_nutrient_allocation()

      # between water & nutients allocation
      if typeof between_water_and_nutrient_allocation == 'function'
        between_water_and_nutrient_allocation()

      # after water & nutrients allocation
      if typeof after_water_and_nutrient_allocation == 'function'
        after_water_and_nutrient_allocation()
  
    
