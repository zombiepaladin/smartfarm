# Place all the behaviors and hooks related to the matching controller here.
# All this logic will automatically be available in application.js.
# You can use CoffeeScript in this file: http://coffeescript.org/
jQuery ->

  if $('#simulation-controls').length > 0

    # Create the simulation object
    simulation = {

      # time details
      start_date: new Date('2014-6-1')
      end_date: new Date('2014-7-31')
      elapsed_time: 0

      regions_to_process: 0
      regions: [
        {
          weather: {}
          weather_worker: new Worker('/weather/5.js')
          patches_to_process: 0
          patches: [
            {
              soil: {}
              soil_worker: new Worker('/soils/1.js')
            },
            {
              soil: {}
              soil_worker: new Worker('/soils/1.js')
            },
            {
              soil: {}
              soil_worker: new Worker('/soils/1.js')
            }
          ]
        }
        {
          weather: {}
          weather_worker: new Worker('/weather/5.js')
          patches_to_process: 0
          patches: []
        }

      ]
    }
    simulation.regions = for index in [1..50]
      weather: {}
      weather_worker: new Worker('/weather/5.js')
      patches_to_process: 0
      patches: []
    window.simulation = simulation

    soil_listener = (msg) ->
      console.log("SOIL CALLBACK")
      switch msg.data.type
        when "step complete" 
          console.log(msg.data.soil)

    # Tie in the simulation callbacks
    simulation.regions.forEach (region, region_index) ->
      region.weather_worker.onmessage = (msg) ->
         weather_callback(region_index, msg.data)
         region.patches.forEach (patch, patch_index) ->
           patch.soil_worker.onmessage = (msg) ->
             soil_listener(msg)
             #soil_callback(region_index, soil_index, msg.data)

    step = () ->

      # add a minute to the simulation's clock
      #simulation.elapsed_time += 1

      # calculate the simulation's date & time
      elapsed_ms = simulation.elapsed_time * 60000;
      simtime = new Date(simulation.start_date.getMilliseconds() + elapsed_ms)

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

      $('#simulation-clock').html( simtime.getHours() + ':' + simtime.getMinutes() )

      # Update regions
      simulation.regions_to_process = simulation.regions.length
      simulation.regions.forEach (region) ->
        region.weather = region.weather_worker.postMessage
          simulation: 
            elapsed_time: simulation.elapsed_time

    weather_callback = (index, weather) ->
      console.log("WEATHER CALLBACK")
      simulation.regions[index].weather = weather
      simulation.regions_to_process -= 1

      # Weather data is ready, update patches
      simulation.regions[index].patches_to_process = simulation.regions[index].patches.length
      simulation.regions[index].patches.forEach (patch) ->
        console.log("posting step")
        patch.soil_worker.postMessage
          type: "step"
          simulation: 
            elapsed_time: simulation.elapsed_time
          weather: weather

      # if weather for the last region was processed, move on to next step
      #if (simulation.regions_to_process = 0) 
      console.log(weather)
      console.log(simulation.regions_to_process + " regions processing")

    soil_callback = (region_index, patch_index, soil) ->
      simulation.regions[region_index].patches[patch_index].soil = soil
      simulation.regions[region_index].patches_to_process -= 1
      console.log(soil)
  
    run  = $('#simulation-run')
    pause = $('#simulation-pause')
    restart = $('#simulation-restart')

    run.on 'click', () ->
      step()
      #simulation.interval = setInterval(step, simulation.rate)        
      simulation.paused = false

    pause.on 'click', () ->
      clearInterval(simulation.interval)
      simulation.paused = true

    restart.on 'click', () ->
      window.location = window.location
