# Place all the behaviors and hooks related to the matching controller here.
# All this logic will automatically be available in application.js.
# You can use CoffeeScript in this file: http://coffeescript.org/
wrapAngle = (angle) ->
  angle += 2*Math.PI while angle < -Math.PI
  angle -= 2*Math.PI while angle >  Math.PI
  angle
clampAngle = (angle, min, max) ->
  angle = min if angle < min
  angle = max if angle > max
  angle
steerAngle = (desired, current, speed) ->
  angle = wrapAngle(desired - current)
  angle = clampAngle(angle, -speed, speed)
  angle = wrapAngle(angle + current)
  angle

jQuery ->

  # New simulation form controls
  #=======================================================

  if($('.simulation-form').size() > 0) 
    canvas = $('#thumb')[0]
    ctx = canvas.getContext('2d')

    $('.farm a').on 'click', (event) ->
      event.preventDefault()
      $('#selected-farms').children().detach().appendTo("#unselected-farms")
      selected = $(this).parent().detach().appendTo('#selected-farms')
      farm = 
        id: selected.data('id')
      $('#simulation_farm').val( JSON.stringify(farm) )
      $.ajax "/farms/#{farm.id}.json", 
        success: (data) ->
          console.log(data)
          data.field_bounds.forEach (bound) ->
            console.log(bound)
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
      offset = $('#farm-display').offset()
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
      weather: {rainfall: 0, snowfall: 0}


    simulation.worker.onmessage = (msg) ->
      console.log(msg.data)
      switch msg.data.type 
        when 'size_update' then updateSize(msg.data.size)
        when 'time_update' then updateTime(msg.data.time)
        when 'weather_update' then updateWeather(msg.data.weather)
        when 'soil_data_layer_update' then updateSoilDataLayer(msg.data.layer_name, msg.data.layer_data)
        when 'crop_data_layer_update' then updateCropDataLayer(msg.data.crop_id, msg.data.layer_name, msg.data.layer_data)
          

    simulation.worker.postMessage({type: 'init'})

    # data layer colors
    layerColors = {}
    layerColors["snow_cover"] = [100, 100, 100]
    layerColors["water_content"] = [0, 0, 255]
    layerColors["wilting_point"] = [100, 100, 100]
    layerColors["percolation_travel_time"] = [100, 100, 100]
    layerColors["porosity"] = [100, 100, 100]
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

    layerColors["biomass_roots"]= [100, 100, 100]
    layerColors["biomass_stems"]= [100, 100, 100]
    layerColors["biomass_leaves"]= [100, 100, 100]
    layerColors["biomass_storage_organs"]= [100, 100, 100]
    layerColors["biomass_reproductive_organs"]= [100, 100, 100]
 
    updateSize = (size) ->
      simulation.size = size
      initializeGame(size)
      initializeDataLayers(size)

    initializeDataLayers = (size) ->

      # field outlines in soil data
      soilDataLayers = $('#soil-data-layers')
      fields = $("<canvas id='fields' class='layer' width=#{size.width * 50} height=#{size.height * 50}>")
      ctx = fields[0].getContext('2d');
      simulation.size.fields.forEach (field) ->
        ctx.beginPath();
        field.forEach (corner) ->
          ctx.lineTo(corner.x * 50, corner.y * 50)
        ctx.closePath()
        ctx.stroke()
      soilDataLayers.append(fields)
      
      # soil data layers
      soilLayerCheckboxes = $('#soil-data-layer-checkboxes')
      attributes = [
        "snow_cover", "water_content", "wilting_point", "percolation_travel_time", "porosity",
        "nitrate", "ammonium", "fresh_organic_nitrogen", "active_organic_nitrogen", "stable_organic_nitrogen",
        "labile_phosphorus", "fresh_organic_phosphorus", "bound_organic_phosphorus", "active_mineral_phosphorus", "stable_mineral_phosphorus",
        "flat_residue_carbon", "humus_carbon",
      ]
      attributes.forEach (name) ->
        layer = $("<canvas id='#{name}' class='layer' width=#{size.width} height=#{size.height} style='display: none;'></canvas>")
        simulation.layerContexts[name] = layer[0].getContext('2d');
        soilDataLayers.prepend(layer)
        soilLayerCheckboxes.append("<div class='checkbox'><label for='cb_#{name}'><input name='#{name}' id='cb_#{name}' type='checkbox'>#{name.replace('_',' ').replace('_',' ')}</label></div>")
        
      $('#soil-data-layer-checkboxes input').on 'change', (event) ->
        $('#' + $(this).attr('name')).toggle()

      # field outlines in crop data
      cropDataLayers = $('#crop-data-layers')
      fields = $("<canvas id='fields' class='layer' width=#{size.width * 50} height=#{size.height * 50}>")
      ctx = fields[0].getContext('2d');
      simulation.size.fields.forEach (field) ->
        ctx.beginPath();
        field.forEach (corner) ->
          ctx.lineTo(corner.x * 50, corner.y * 50)
        ctx.closePath()
        ctx.stroke()
      cropDataLayers.append(fields)


#        "biomass_roots", "biomass_stems", "biomass_leaves", "biomass_storage_organs", "biomass_reproductive_organs"


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
      simulation.weather = weather
    
    updateSoilDataLayer = (name, data) ->
      if(name == 'snow_cover') 
        game.weather.snow_cover.data = data
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

    updateCropDataLayer = (id, name, data) ->
      console.log("updating crop #{id}")

    # Create the game objects
    game.combine =
      x: 0 
      y: 0
      angle: 0
      image: new Image()
    game.combine.image.src = "/assets/combine.png"

    game.tractor =
      x: 0
      y: 0
      angle: 0
      image: new Image()
    game.tractor.image.src = "/assets/tractor.png"

    game.plow =
      x: 0
      y: 0
      angle: 0
      image: new Image()
      stamp: new Image()
    game.plow.image.src = "/assets/plow.png"
    game.plow.stamp.src = "/assets/plow_trail.png"

    game.drill =
      x: 0
      y: 0
      angle: 0
      image: new Image()
      stamp: new Image()
    game.drill.image.src = "/assets/drill.png"
    game.drill.stamp.src = "/assets/drill_trail.png"

    game.weather =
      rain:
       image: new Image()
      snow:
        image: new Image()
      snow_cover: 
        image: new Image()
    game.weather.rain.image.src = "/assets/rain.png"
    game.weather.snow.image.src = "/assets/snow.png"
    game.weather.snow_cover.image.src = "/assets/snow_cover.png"

    initializeGame = () ->

      # In the game, 1px = 1meter 
      game.width = simulation.size.width * simulation.size.granularity
      game.height = simulation.size.height * simulation.size.granularity
      game.buffers =
        front: $("<canvas width=800 height=600>")[0]
        back: $("<canvas width=#{game.width} height=#{game.height}>")[0]
        terrain: $("<canvas width=#{game.width} height=#{game.height}>")[0]
      game.ctx = 
        front: game.buffers.front.getContext('2d')
        back: game.buffers.back.getContext('2d')
        terrain: game.buffers.terrain.getContext('2d')
      game.hq = 
        x: simulation.size.location.x * simulation.size.granularity,
        y: simulation.size.location.y * simulation.size.granularity
      game.viewport = 
        x: 0 
        y: 0
        width: 800
        height: 600
        radius: 500
        target: game.hq
      game.combine.x = game.hq.x
      game.combine.y = game.hq.y
      game.tractor.x = game.hq.x
      game.tractor.y = game.hq.y
      game.plow.x = game.hq.x
      game.plow.y = game.hq.y
      game.drill.x = game.hq.x
      game.drill.y = game.hq.y

      # Draw the terrain 
      game.ctx.terrain.fillStyle = 'tan'
      game.ctx.terrain.fillRect(0,0,game.width, game.height)
      game.ctx.terrain.strokeStyle = 'yellow'
      game.ctx.terrain.lineWidth = 5
      simulation.size.fields.forEach (field) ->
        game.ctx.terrain.beginPath();
        field.forEach (corner) ->
          game.ctx.terrain.lineTo(corner.x * simulation.size.granularity, corner.y * simulation.size.granularity)
        game.ctx.terrain.closePath()
        game.ctx.terrain.stroke()

      # Render the game
      game.ctx.front.drawImage(game.buffers.terrain, 0, 0)

      #display front buffer
      $('#farm #farm-display').append(game.buffers.front)


    updateGame = () ->
      console.log(game.state)

      switch game.state
        when 'tilling'
          dy = game.mouse.y + game.viewport.y - game.tractor.y
          dx = game.mouse.x + game.viewport.x - game.tractor.x
          distance = Math.sqrt(dx*dx + dy*dy)
          # Note: 1mi/hr = 0.0074506m/minute
          speed = 5
          if distance > 10
            game.tractor.angle = steerAngle(Math.atan2(dy, dx), game.tractor.angle, Math.PI / 8)
            game.tractor.x += speed * Math.cos(game.tractor.angle)
            game.tractor.y += speed * Math.sin(game.tractor.angle)
            game.plow.x = -5 * Math.cos(game.tractor.angle) + game.tractor.x
            game.plow.y = -5 * Math.sin(game.tractor.angle) + game.tractor.y
            game.plow.angle = steerAngle(game.tractor.angle, game.plow.angle, Math.PI / 16) 
            game.ctx.terrain.save()
            game.ctx.terrain.fillStyle = '#3d1f00'
            x = game.plow.x
            y = game.plow.y
            game.ctx.terrain.translate(x, y)
            game.ctx.terrain.rotate(game.plow.angle)
            game.ctx.terrain.drawImage(game.plow.stamp,-22,-9)
            game.ctx.terrain.restore()
        when 'planting'
          dy = game.mouse.y + game.viewport.y - game.tractor.y
          dx = game.mouse.x + game.viewport.x - game.tractor.x
          distance = Math.sqrt(dx*dx + dy*dy)
          speed = 5
          if distance > 10
            game.tractor.angle = steerAngle(Math.atan2(dy, dx), game.tractor.angle, Math.PI / 8)
            game.tractor.x += speed * Math.cos(game.tractor.angle)
            game.tractor.y += speed * Math.sin(game.tractor.angle)
            game.drill.x = -5 * Math.cos(game.tractor.angle) + game.tractor.x
            game.drill.y = -5 * Math.sin(game.tractor.angle) + game.tractor.y
            game.drill.angle = steerAngle(game.tractor.angle, game.drill.angle, Math.PI / 16) 
            game.ctx.terrain.save()
            game.ctx.terrain.fillStyle = '#3d1f00'
            x = game.drill.x
            y = game.drill.y
            game.ctx.terrain.translate(x, y)
            game.ctx.terrain.rotate(game.drill.angle)
            game.ctx.terrain.drawImage(game.drill.stamp, -18, -9)
            game.ctx.terrain.restore()
        when 'harvesting'
          dy = game.mouse.y + game.viewport.y - game.combine.y
          dx = game.mouse.x + game.viewport.x - game.combine.x
          distance = Math.sqrt(dx*dx + dy*dy)
          speed = 5
          if distance > 10
            game.combine.angle = Math.atan2(dy, dx) 
            game.combine.x += speed * dx/distance
            game.combine.y += speed * dy/distance
            # TODO: Recolor harvested swath
      
      # Update the viewport (scroll the game)
      if game.viewport.target.x < game.viewport.width / 2
        game.viewport.x = 0
      else if game.viewport.target.x > game.width - game.viewport.width / 2
        game.viewport.x = game.width - game.viewport.width
      else
        game.viewport.x = game.viewport.target.x - game.viewport.width / 2
      if game.viewport.target.y < game.viewport.height / 2
        game.viewport.y = 0
      else if game.viewport.target.y > game.height - game.viewport.height / 2
        game.viewport.y = game.height - game.viewport.height
      else
        game.viewport.y = game.viewport.target.y - game.viewport.height / 2

    renderGame = () ->  
      # render changes to terrain

      # copy terrain to back buffer (effectively clearing back buffer)
      game.ctx.back.drawImage(game.buffers.terrain, 0, 0)
    
      # render combine
      game.ctx.back.save()
      game.ctx.back.translate(game.combine.x, game.combine.y)
      game.ctx.back.rotate(game.combine.angle)
      game.ctx.back.drawImage(game.combine.image, -6, -9)
      game.ctx.back.restore()

      # render plow
      game.ctx.back.save()
      game.ctx.back.translate(game.plow.x, game.plow.y)
      game.ctx.back.rotate(game.plow.angle)
      game.ctx.back.drawImage(game.plow.image, -17, -9)
      game.ctx.back.restore()

      # render drill
      game.ctx.back.save()
      game.ctx.back.translate(game.drill.x, game.drill.y)
      game.ctx.back.rotate(game.drill.angle)
      game.ctx.back.drawImage(game.drill.image, -13, -9)
      game.ctx.back.restore()

      # render tractor
      game.ctx.back.save()
      game.ctx.back.translate(game.tractor.x, game.tractor.y)
      game.ctx.back.rotate(game.tractor.angle)
      game.ctx.back.drawImage(game.tractor.image, -5, -5)
      game.ctx.back.restore()
      
      # render precipitation
      if(simulation.weather.rainfall > 0)
        game.ctx.back.save() 
        pattern = game.ctx.back.createPattern(game.weather.rain.image, 'repeat')
        game.ctx.back.fillStyle = pattern
        game.ctx.back.translate(game.viewport.x + game.viewport.width/2, game.viewport.y + game.viewport.height/2)
        game.ctx.back.rotate(simulation.weather.wind_direction * 0.0174543925)
        game.ctx.back.translate(0, Date.now() % 30)
        game.ctx.back.fillRect(-game.viewport.radius-30, -game.viewport.radius-30, 2*game.viewport.radius+30, 2*game.viewport.radius+30)
        game.ctx.back.restore()
      if(simulation.weather.snowfall > 0) 
        game.ctx.back.save()
        pattern = game.ctx.back.createPattern(game.weather.snow.image, 'repeat')
        game.ctx.back.fillStyle = pattern
        game.ctx.back.translate(game.viewport.x + game.viewport.width/2, game.viewport.y + game.viewport.height/2)
        game.ctx.back.rotate(simulation.weather.wind_direction * 0.0174543925)
        game.ctx.back.translate(0, Date.now() % 30)
        game.ctx.back.fillRect(-game.viewport.radius-30, -game.viewport.radius-30, 2*game.viewport.radius+30, 2*game.viewport.radius+30)
        game.ctx.back.restore()
      
      # render snow cover
      if(game.weather.snow_cover.data)
        game.ctx.back.save()
        pattern = game.ctx.back.createPattern(game.weather.snow_cover.image, 'repeat')
        game.ctx.back.fillStyle = pattern;
        granularity = simulation.size.granularity
        for x in [0...simulation.size.width] by 1
          for y in [0...simulation.size.height] by 1 
            for i in [0...Math.min(5, Math.ceil(game.weather.snow_cover.data[x + y * simulation.size.width] / 5))] by 1 
              game.ctx.back.fillRect(x * granularity, y * granularity, granularity, granularity);
        game.ctx.back.restore()

      # copy back buffer to front buffer
      game.ctx.front.drawImage(game.buffers.back, -game.viewport.x, -game.viewport.y)

    $('#manual-till').on 'click', () ->
      game.state = 'tilling'
      game.viewport.target = game.tractor

    $('#auto-till').on 'click', () ->
      $('#field-select-modal').modal().one 'hidden.bs.modal', () ->
        console.log($('input[name="field_id"]:checked').val())

    $('#manual-plant').on 'click', () ->
      game.state = 'planting'
      game.viewport.target = game.tractor

    $('#manual-harvest').on 'click', () ->
      game.state = 'harvesting'
      game.viewport.target = game.combine


    $('#field-select-map polygon').on 'click', () ->
      index = $(this).data('field-index')
      boxes = $("input[name=field_id]")
      boxes.prop('checked', false).parent().removeClass("active")
      console.log(index)
      boxes.filter("[value=#{index}]").prop('checked', true).parent().addClass("active")
  
    run  = $('#simulation-run')
    pause = $('#simulation-pause')
    restart = $('#simulation-restart')

    step = () ->
      console.log('step')
      simulation.worker.postMessage({type: 'tick'});
      updateGame()
      renderGame()

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


