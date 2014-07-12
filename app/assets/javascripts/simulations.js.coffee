# Place all the behaviors and hooks related to the matching controller here.
# All this logic will automatically be available in application.js.
# You can use CoffeeScript in this file: http://coffeescript.org/
jQuery ->

  # New simulation form controls
  #=======================================================

  if($('.simulation-form').size() > 0) 

    $('.farm a').on 'click', (event) ->
      event.preventDefault()
      $('#selected-farms').children().detach().appendTo("#unselected-farms")
      selected = $(this).parent().detach().appendTo('#selected-farms')
      farm = 
        id: selected.data('id')
      $('#simulation_farm').val( JSON.stringify(farm) )
      return false

    $('.weather a').on 'click', (event) ->
      event.preventDefault()
      $('#selected-weather').children().detach().appendTo("#unselected-weater")
      selected = $(this).parent().detach().appendTo('#selected-weather')
      weather = 
        id: selected.data('id')
      $('#simulation_weather').val( JSON.stringify(weather) )
      return false

    saveButton = $('button#save');
    saveButton.on 'click', (event) ->

      #event.preventDefault()
      simulation = {}
      simulation.farm = JSON.parse( $('#simulation_farm').val() )
      simulation.weather = JSON.parse( $('#simulation_weather').val() )

      $('#simulation_state').val( JSON.stringify(simulation) )
      console.log(simulation)


  # Simulation running controls
  #=========================================================

  if $('#simulation-controls').length > 0

    # Create the game object
    game = 
      state: 'observer'
      mouse: {x: 0, y: 0}

    # Track mouse position
    $(document).on 'mousemove', (me) ->
      offset = $('#equipment').offset()
      game.mouse.x = me.pageX - offset.left
      game.mouse.y = me.pageY - offset.top


    # Create the simulation object
    simulation = 
      worker: new Worker(window.location.toString() + '.js')
      rate: 1000
      interval: undefined
      paused: true
      size: {width: 0, height: 0}
      operationContext: undefined
      layerContexts: {}


    simulation.worker.onmessage = (msg) ->
      console.log(msg.data)
      switch msg.data.type 
        when 'size_update' then updateSize(msg.data.size)
        when 'time_update' then updateTime(msg.data.time)
        when 'weather_update' then updateWeather(msg.data.weather)
        when 'data_layer_update' then updateDataLayer(msg.data.layer_name, msg.data.layer_data)
          

    simulation.worker.postMessage({type: 'init'})

    # data layer colors
    layerColors = {}
    layerColors["water_content"] = [0, 0, 255]
    layerColors["nitrate"] = [100, 100, 100]
    layerColors["ammonium"]= [100, 100, 100]
    layerColors["fresh_organic_nitrogen"]= [100, 100, 100]
    layerColors["active_organic_nitrogen"]= [100, 100, 100]
    layerColors["stable_organic_nitrogen"]= [100, 100, 100]
    layerColors["labile_phosphorus"]= [100, 100, 100]
    layerColors["fresh_organic_phosphorus"]= [100, 100, 100]
    layerColors["bound_organic_phosphorus"]= [100, 100, 100]
    layerColors["active_mineral_phosphorus"]= [100, 100, 100]
    layerColors["stable_mineral_phosphorus"]= [100, 100, 100]
    layerColors["flat_residue_carbon"]= [100, 100, 100]
    layerColors["humus_carbon"]= [100, 100, 100]
 
    updateSize = (size) ->
      simulation.size = size
      initializeGame(size)
      initializeDataLayers(size)

    initializeDataLayers = (size) ->

      # field outlines in data layers
      layers = $('#data-layers')
      fields = $("<canvas id='fields' class='layer' width=#{size.width * 50} height=#{size.height * 50}>")
      ctx = fields[0].getContext('2d');
      simulation.size.fields.forEach (field) ->
        ctx.beginPath();
        field.forEach (corner) ->
          ctx.lineTo(corner.x * 50, corner.y * 50)
        ctx.closePath()
        ctx.stroke()
      layers.append(fields)
      
      # data layers
      layerCheckboxes = $('#data-layer-checkboxes')
      attributes = [
        "water_content",
        "nitrate", "ammonium", "fresh_organic_nitrogen", "active_organic_nitrogen", "stable_organic_nitrogen",
        "labile_phosphorus", "fresh_organic_phosphorus", "bound_organic_phosphorus", "active_mineral_phosphorus", "stable_mineral_phosphorus",
        "flat_residue_carbon", "humus_carbon"
      ]
      attributes.forEach (name) ->
        layer = $("<canvas id='#{name}' class='layer' width=#{size.width} height=#{size.height} style='display: none;'></canvas>")
        simulation.layerContexts[name] = layer[0].getContext('2d');
        layers.prepend(layer)
        layerCheckboxes.append("<div class='checkbox'><label for='cb_#{name}'><input name='#{name}' id='cb_#{name}' type='checkbox'>#{name.replace('_',' ').replace('_',' ')}</label></div>")
        
      $('#data-layer-checkboxes input').on 'change', (event) ->
        $('#' + $(this).attr('name')).toggle()

      window.simulation = simulation


    updateTime = (time) ->
      simtime = new Date(time)

      switch(simtime.getMonth()) 
        when 1 then $('#calendar-month').html('Jan')
        when 2 then $('#calendar-month').html('Feb')
        when 3 then $('#calendar-month').html('Mar')
        when 4 then $('#calendar-month').html('Apr')
        when 5 then $('#calendar-month').html('May')
        when 6 then $('#calendar-month').html('Jun')
        when 7 then $('#calendar-month').html('Jul')
        when 8 then $('#calendar-month').html('Aug')
        when 9 then $('#calendar-month').html('Sep')
        when 10 then $('#calendar-month').html('Oct')
        when 11 then $('#calendar-month').html('Nov')
        when 12 then $('#calendar-month').html('Dec')

      $('#calendar-day').html( simtime.getDate() );

      #simtime.getHours() + ':' + ( '0' + simtime.getMinutes())
      $('#simulation-clock').html( simtime.getHours() + ':' + ('0' + simtime.getMinutes()).slice(-2) )

    updateWeather = (weather) ->
    
    updateDataLayer = (name, data) ->
      brush = simulation.layerContexts[name].createImageData(1,1)
      brushData = brush.data
      brushData[0] = layerColors[name][0]
      brushData[1] = layerColors[name][1]
      brushData[2] = layerColors[name][2]
      for y in [0..simulation.size.height] by 1
        offset = y * simulation.size.width
        for x in [0..simulation.size.width] by 1
          brushData[3] = data[x + offset]
          simulation.layerContexts[name].putImageData(brush, x, y)

    updateWaterContent = (water_content) ->
      brush = simulation.layerContexts.water_content.createImageData(1,1)
      brushData = brush.data;
      brushData[0] = 90
      brushData[1] = 151
      brushData[2] = 206
      for y in [0..simulation.size.height] by 1
        offset = y * simulation.size.width
        for x in [0..simulation.size.width] by 1
          brushData[3] = water_content[x + offset]
          simulation.layerContexts.water_content.putImageData(brush, x, y)

    updateNitrate = (nitrate) ->
      brush = simulation.layerContexts.nitrate.createImageData(1,1)
      brushData = brush.data;
      brushData[0] = 224
      brushData[1] = 73
      brushData[2] = 87
      for y in [0..simulation.size.height] by 1
        offset = y * simulation.size.width
        for x in [0..simulation.size.width] by 1
#          console.log(water[x + offset])
          brushData[3] = soil.nitrate[x + offset] 
          simulation.layerContexts.nitrate.putImageData(brush, x, y)


    # Create the game objects
    game.combine =
      x: 200 
      y: 200
      angle: 15
      image: new Image()
    game.combine.image.src = "/assets/combine.png"


    initializeGame = () ->

      # In the game, 1px = 1meter 
      game.width = simulation.size.width * simulation.size.granularity
      game.height = simulation.size.height * simulation.size.granularity
      game.hq = 
        x: simulation.size.location.x * simulation.size.granularity,
        y: simulation.size.location.y * simulation.size.granularity
      console.log(game)

      game.ctx = {}

      operations = $("<canvas id='operations' width=#{game.width} height=#{game.height}>")
      game.ctx.operations = operations[0].getContext('2d')
      game.ctx.operations.fillStyle = 'tan'
      game.ctx.operations.fillRect(0,0,game.width, game.height)
      game.ctx.operations.strokeStyle = 'yellow'
      game.ctx.lineWidth = 5
      simulation.size.fields.forEach (field) ->
        game.ctx.operations.beginPath();
        field.forEach (corner) ->
          game.ctx.operations.lineTo(corner.x * simulation.size.granularity, corner.y * simulation.size.granularity)
        game.ctx.operations.closePath()
        game.ctx.operations.stroke()
      $('#farm .farm-display').prepend(operations)

      game.combine.x = game.hq.x
      game.combine.y = game.hq.y

      equipment = $("<canvas id='equipment' width=#{game.width} height=#{game.height} style='position: absolute;'>")
      game.ctx.equipment = equipment[0].getContext('2d')
      game.ctx.equipment.drawImage(game.combine.image, game.combine.x, game.combine.y)

      $('#farm .farm-display').prepend(equipment)


    updateGame = () ->
      console.log(game.state)
      switch game.state
        when 'harvesting'
          game.combine.x = game.mouse.x
          game.combine.y = game.mouse.y
          console.log(game.combine)
      
      console.log("render (#{simulation.size.width}, #{simulation.size.height})")
      # render
      if simulation.equipmentContext
        simulation.equipmentContext.save()
        #simulation.equipmentContext.rotate(game.combine.angle)
        #simulation.equipmentContext.translate(0, 0)
        simulation.equipmentContext.drawImage(game.combine.image, game.combine.x, game.combine.y)
        simulation.equipmentContext.restore()
        console.log("done")

    $('#harvest').on 'click', () ->
      game.state = 'harvesting'
  
    run  = $('#simulation-run')
    pause = $('#simulation-pause')
    restart = $('#simulation-restart')

    step = () ->
      console.log('step')
      simulation.worker.postMessage({type: 'tick'});
      updateGame()

    run.on 'click', () ->
      console.log('before step')
      simulation.interval = setInterval(step, 100)        
      simulation.paused = false

    pause.on 'click', () ->
      clearInterval(simulation.interval)
      simulation.paused = true

    restart.on 'click', () ->
      clearInterval(simulation.interval)
      simulation.paused = true
      simulation.worker.postMessage({type: 'init'})
#      window.location = window.location


