\# Place all the behaviors and hooks related to the matching controller here.
# All this logic will automatically be available in application.js.
# You can use CoffeeScript in this file: http://coffeescript.org/

jQuery ->
  farm_data = $('#farm_data')
  if farm_data.size() > 0
    farm = JSON.parse(farm_data.val())
    window.farm = farm


    # Location Map controls & data
    #-----------------------------------

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
      

    # Field Map controls & data
    #------------------------------------

    fieldPaths = []

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
            
    farm.field_bounds.forEach (bounds, i) ->
      path = []
      bounds.forEach (coord, j) ->
        farm.fieldPaths
        path.push new google.maps.LatLng(coord.latitude, coord.longitude)
        console.log(coord.latitude, coord.longitude)
      fieldPolygon = new google.maps.Polygon
        map: fieldMap
        path: path
        fillColor: '#00ff00'
        draggable: true
        editable: true
      fieldPaths.push(fieldPolygon.getPath())

    bounds = []
    google.maps.event.addListener drawingManager, 'polygoncomplete', (polygon) ->
      bounds.push(polygon);
      fieldPaths.push(polygon.getPath());

    # Soil Map controls & data
    #-------------------------------
     
    soilMap = new google.maps.Map $('#farm_soil_profile_map')[0],
      center: location
      zoom: 14
      mapTypeId: google.maps.MapTypeId.TERRAIN

    soilMapMarker = new google.maps.Marker
      map: soilMap
      title: farm.name
      position: location

    drawingOptions =
      drawingMode: google.maps.drawing.OverlayType.POLYGON
      drawingControl: true
      drawingControlOptions:
        position: google.maps.ControlPosition.TOP_CENTER
        drawingModes: [ google.maps.drawing.OverlayType.POLYGON ]
      polygonOptions:
        fillColor: '#56493D'
        draggable: true
        editable: true
    drawingManager = new google.maps.drawing.DrawingManager drawingOptions
    drawingManager.setMap soilMap




    # General map functions
    #-------------------------------

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
      event.preventDefault()
      $(this).tab('show')
      resetMap fieldMap

    $('#soil-tab').on 'click', (event) ->
      event.preventDefault()
      $(this).tab('show')
      resetMap soilMap


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
    

    elevation_canvas = $('#elevation_bitmap')[0]
    elevation_context = elevation_canvas.getContext('2d')

    # Draw fields to map(s)
    drawFields = () ->
      left = location.lat()
      right = location.lat()
      top = location.lng()
      bottom = location.lng()

      # find the edges
      fields.forEach (field) ->
        left = field.left if field.left < left 
        right = field.right if field.right > right 
        top = field.top if field.top < top
        bottom = field.bottom if field.bottom > bottom 
        console.log("borders", left, right, top, bottom);
 
      # find scaling factors
      scale_x = $('#elevation_bitmap').width() / (right - left);
      scale_y = $('#elevation_botmap').height() / (bottom - top);
      console.log("Scales", scale_x, scale_y)

      # draw the fields
      elevation_context.beginPath()
      fields.forEach (field) ->
        field.border.forEach (loc) ->
          elevation_context.lineTo(
            ((loc.latitiude - left) * scale_x),
            ((loc.longitude - top) * scale_y)
          ) 
          console.log( "drawing line",
            ((loc.latitiude - left) * scale_x),
            ((loc.longitude - top) * scale_y)
          ) 
      elevation_context.stroke()

     # bounds.forEach (boundary, i) ->
     #   if  

    createField = (boundary) ->
      field = 
        bounds: {bottom: location.lat(), left: location.lat(), right: location.lng(), top: location.lng()}
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
        
    $('.edit_farm').on 'submit', (event) ->
      # Submits can be triggered from the "search by address"
      # box, which is probably not the user intent
      if $('#address').is(":focus")
        event.preventDefault()
        searchByAddress()
        return

      farm.location = 
        latitude: location.lat()
        longitude: location.lng()

      farm.field_bounds = []
      fieldPaths.forEach (path, i) ->
        farm.field_bounds[i] = []
        path.forEach (coord, j) ->
          farm.field_bounds[i][j] =
            latitude: coord.lat()
            longitude: coord.lng()

      $('#farm_data').val( JSON.stringify(farm) )
