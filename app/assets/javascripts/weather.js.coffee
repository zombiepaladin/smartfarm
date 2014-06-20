jQuery ->
  editor = $('#weather-editor')
  if(editor.length > 0)
    editor.height($(window).height() - 120);
    Blockly.inject(document.getElementById('weather-editor'), {
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
      $.ajax "/weather/#{editor.data('weather-id')}", 
        method: "PUT"
        #contentType: "JSON"
        data: 
          weather: 
            workspace: xmlText
            code: code
        success: (response) ->
          msg.text(response)
        error: (jXHR, status, err) ->
          msg.text(err);
      

    runButton = $('button#run');
    runButton.on 'click', () ->
      interpreter = new Interpreter(Blockly.JavaScript.workspaceToCode(), initSimulationInterpreter)
      interpreter.run()

  
    $('#average_temperature').on 'change', () ->
      weather.average_temperature = $(this).val()    
