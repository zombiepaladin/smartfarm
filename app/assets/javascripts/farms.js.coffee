# Place all the behaviors and hooks related to the matching controller here.
# All this logic will automatically be available in application.js.
# You can use CoffeeScript in this file: http://coffeescript.org/

jQuery ->
  farm_data = $('#farm_data')
  if farm_data.size() > 0
    farm = JSON.parse(farm_data.val())

    location = new google.maps.LatLng(farm.location.latitude, farm.location.longitude)

    locationMap = new google.maps.Map $('#farm-map')[0],
      center: location
      zoom: 14
      mapTypeId: google.maps.MapTypeId.TERRAIN

    locationMapMarker = new google.maps.Marker
      map: locationMap
      title: farm.name
      position: location
      draggable: true

    google.maps.event.addListener locationMapMarker, 'drag', () ->
      location = locationMapMarker.getPosition()
      $('#farm_latitude').val(location.lat())
      $('#farm_longitude').val(location.lng())

    google.maps.event.addListener locationMapMarker, 'dragend', () ->
      panmap()

    fieldMap = new google.maps.Map $('#farm_field_map')[0], 
      center: location
      zoom: 14
      mapTypeId: google.maps.MapTypeId.TERRAIN

    fieldMapMarker = new google.maps.Marker 
      map: fieldMap
      title: farm.name
      position: location

    drawingOptions = 
      drawingMode: google.maps.drawing.OverlayType.POLYGON
      drawingControl: true
      drawingControlOptions: 
        position: google.maps.ControlPosition.TOP_CENTER
        drawingModes: [ google.maps.drawing.OverlayType.POLYGON ]
      polygonOptions: 
        fillColor: '#00ff00'
        draggable: true
        editable: true
    drawingManager = new google.maps.drawing.DrawingManager drawingOptions
    drawingManager.setMap fieldMap
            
    farm.fields.forEach (field) ->
      path = []
      field.boundary.forEach (coord) ->
        path.push new google.maps.LatLng(coord.latitude, coord.longitude)
        console.log(coord.latitude, coord.longitude)
        console.log("path", path)
        new google.maps.Polygon
          map: map
          path: path
          fillColor: '#00ff00'
          draggable: true
          editable: true

    panmap = () ->
      locationMapMarker.setPosition location
      fieldMapMarker.setPosition location
      locationMap.panTo location
      fieldMap.panTo location

    resetMap = (map) ->
      zoom = map.getZoom()
      center = map.getCenter()
      google.maps.event.trigger map, 'resize'
      map.setZoom zoom
      map.setCenter center

    $('#location-tab').on 'click', (event) ->
      event.preventDefault()
      $(this).tab('show')
      resetMap locationMap

    $('#boundary-tab').on 'click', (event)->
      event.preventDefault();
      $(this).tab('show')
      console.log('resize')
      resetMap fieldMap


    searchByAddress = () ->   
      geocoder = new google.maps.Geocoder()
      address = $('#address').val()
      geocoder.geocode {address: address}, (result, status) ->
        switch status
          when google.maps.GeocoderStatus.OK
            location = result[0].geometry.location
            $('#farm_latitude').val(result[0].geometry.location.lat())
            $('#farm_longitude').val(result[0].geometry.location.lng())
            panmap()
          when google.maps.GeocoderStatus.ZERO_RESULTS
            alert("Zero Results")
          when google.maps.GeocoderStatus.ERROR
            alert("Error")
          when google.maps.GeocoderStatus.INVALID_REQUEST
            alert("Invalid Request")
          when google.maps.GeocoderStatus.OVER_QUERY_LIMIT
            alert("Over Query Limit")
          when google.maps.GeocoderStatus.REQUEST_DENIED
            alert("Request Denied")
          when google.maps.GeocoderStatus.UNKNOWN_ERROR
            alert("Unknown Error")
          else
            alert("unkown")

    $('#search-by-address').on 'click', () ->
      searchByAddress()
    
    $('#farm_name').on 'change', () ->
      farm.name = $('#farm_name').val()
      locationMapMarker.setTitle farm.name
      fieldMapMarker.setTitle farm.name
    
    $('#farm_latitude').on 'change', () -> 
      farm.latitude = $('#farm_latitude').val()
      panmap()

    $('#farm_longitude').on 'change', () ->
      farm.latitude = $('#farm_longitude').val()
      panmap()
    
    bounds = []

    google.maps.event.addListener drawingManager, 'polygoncomplete', (polygon) ->
      bounds.push(polygon);

    createField = (boundary) ->
      field = 
        bounds: {bottom:0, left:0, right:0, top:0}
        border: []
        patches: []
      boundary.getPath().forEach (coord, i) ->
        lat = coord.lat()
        field.bounds.left = lat if lat < field.bounds.left
        field.bounds.right = lat if lat > field.bounds.right
        lng = coord.lng()
        field.bounds.bottom = lng if lng < field.bounds.bottom
        field.bounds.top = lng if lng > field.bounds.top
        field.border[i] = 
          latitude: lat
          longitude: lng
      field
        
    $('#new_farm').on 'submit', (event) ->
      # Submits can be triggered from the "search by address"
      # box, which is probably not the user intent
      if $('#address').is(":focus")
        console.log('donothing')
        event.preventDefault()
        searchByAddress()
        return
      boundaries = []
      bounds.forEach (boundary, i) ->
        boundaries[i] = []
        boundary.getPath().forEach (coord, j) ->
          boundaries[i][j] = 
            latitude: coord.lat()
            longitude: coord.lng()
      loc = {
        latitude: location.lat(),
        longitude: location.lng()
      }
      farm = new Farm(farm.name, loc, boundaries)
      $('#farm_data').val JSON.stringify(farm)

      
