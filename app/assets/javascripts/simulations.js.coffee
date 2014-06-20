# Place all the behaviors and hooks related to the matching controller here.
# All this logic will automatically be available in application.js.
# You can use CoffeeScript in this file: http://coffeescript.org/
jQuery ->

  start_date = new Date('2014-6-1')
  end_date = new Date('2014-7-31')

  step = () ->

    # add a minute to the simulation's clock
    simulation.elapsed_time += 1

    # calculate the simulation's date & time
    elapsed_ms = simulation.elapsed_time * 60000;
    simtime = new Date(start_date.getMilliseconds() + elapsed_ms)

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
  
  run  = $('#simulation-run')
  pause = $('#simulation-pause')
  restart = $('#simulation-restart')

  run.on 'click', () ->
    simulation.interval = setInterval(step, simulation.rate)        
    simulation.paused = false

  pause.on 'click', () ->
    clearInterval(simulation.interval)
    simulation.paused = true

  restart.on 'click', () ->
    window.location = window.location
