jQuery ->
  editor = $('#weather-editor')
  if(editor.length > 0)

    # Resize editor to fit window
    editor.height($(window).height() - 120);
    $('#weather-iopanel').height(editor.height());

    # Setup Blockly
    Blockly.JavaScript.addReservedWords('highlightBlock')
    Blockly.inject(document.getElementById('weather-editor'), {
      path: '/assets/blockly/', 
      toolbox: document.getElementById('toolbox')
    })
    Blockly.Xml.domToWorkspace(
      Blockly.mainWorkspace, 
      document.getElementById('workspace')
    )

    # Add a saved/needs saving message
    msg = $('#message');
    Blockly.addChangeListener () ->
      msg.text("Changed...")
    callback = -> msg.text("")
    setTimeout callback, 100

    # Add a save button
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

    # Add an output getter and setter to the interpreter
    outputAttrAccessor = (name, interpreter, scope) ->

      # getter
      wrapper = () ->
        num = $('#' + name).html()
        num = parseFloat(num)
        return interpreter.createPrimitive(num)
      interpreter.setProperty(scope, 'get_' + name, interpreter.createNativeFunction(wrapper))

      # setter
      wrapper = (num) ->
        num = if num then parseFloat(num) else 0
        return interpreter.createPrimitive($('#' + name).html(num))
      interpreter.setProperty(scope, 'set_' + name, interpreter.createNativeFunction(wrapper))

    # Add an input getter and setter to the interpreter
    inputAttrAccessor = (name, interpreter, scope) ->

      # getter
      wrapper = () ->
        num = $('#' + name).val()
        num = parseFloat(num)
        return interpreter.createPrimitive(num);
      interpreter.setProperty(scope, 'get_' + name, interpreter.createNativeFunction(wrapper))

      # setter
      wrapper = (num) ->
        num = if num then parseFloat(num) else 0
        return interpreter.createPrimitive($('#' + name).val(num));
      interpreter.setProperty(scope, 'set_' + name, interpreter.createNativeFunction(wrapper))

    # Set up the JS interpreter
    setupWeatherSystem = (interpreter, scope) ->

      # alert() function
      wrapper = (text) ->
        text = if text then text.toString() else ''
        return interpreter.createPrimitive(alert(text))
      interpreter.setProperty(scope, 'alert', interpreter.createNativeFunction(wrapper))

      # prompt() function
      wrapper = (text) ->
        text if text then text.toString() else ''
        return interpreter.createPrimitive(prompt(text))
      interpreter.setProperty(scope, 'prompt', interpreter.createNativeFunction(wrapper))

      # elapsed time
      wrapper = () ->
        num = $('#elapsed_time').val()
        num = parseInt(num)
        return interpreter.createPrimitive(num);
      interpreter.setProperty(scope, 'get_elapsed_time', interpreter.createNativeFunction(wrapper))

      # simulation attribute getters/setters
      attributes = ["latitude", "longitude"]
      attributes.forEach (name) ->
        inputAttrAccessor(name, interpreter, scope)

      # weather attribute getters/setters
      attributes = ["rainfall", "snowfall", "average_temperature", "high_temperature", "low_temperature", "wind_speed", "wind_direction", "relative_humidity"]
      attributes.forEach (name) ->
        outputAttrAccessor(name, interpreter, scope)

    interpreter = undefined
    nextStep = () ->
      if interpreter
        if !interpreter.step()
          interpreter = undefined

    stepButton = $('button#step')
    stepButton.on 'click', () ->
      if !interpreter
        interpreter = new Interpreter(Blockly.JavaScript.workspaceToCode(), setupWeatherSystem)
      nextStep()

    # Add a run button
    runButton = $('button#run')
    runButton.on 'click', () ->
      interpreter = new Interpreter(Blockly.JavaScript.workspaceToCode(), setupWeatherSystem)
      interpreter.run()

  
