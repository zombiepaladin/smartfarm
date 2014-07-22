# Place all the behaviors and hooks related to the matching controller here.
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

    farm.field_bounds.forEach (bounds, i) ->
      path = []
      bounds.forEach (coord, j) ->
        farm.fieldPaths
        path.push new google.maps.LatLng(coord.latitude, coord.longitude)
      new google.maps.Polygon
        map: locationMap
        path: path
        fillColor: '#00ff00'
        strokeColor: '#00cc00'
        draggable: false
        editable: false

      

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
      new google.maps.Polygon
        map: locationMap
        path: polygon.getPath()
        fillColor: '#00ff00'
        strokeColor: '#00cc00'
        draggable: false
        editable: false
      new google.maps.Polygon
        map: elevationMap
        path: polygon.getPath()
        fillColor: '#00ff00'
        strokeColor: '#00cc00'
        draggable: false
        editable: false
      new google.maps.Polygon
        map: soilMap
        path: polygon.getPath()
        fillColor: '#00ff00'
        strokeColor: '#00cc00'
        draggable: false
        editable: false



    # Elevation Map controls & data
    #-------------------------------
    elevationMap = new google.maps.Map $('#farm_elevation_map')[0],
      center: location
      zoom: 14
      mapTypeId: google.maps.MapTypeId.TERRAIN

    elevationMapMarker = new google.maps.Marker
      map: elevationMap
      title: farm.name
      postion: location

    farm.field_bounds.forEach (bounds, i) ->
      path = []
      bounds.forEach (coord, j) ->
        farm.fieldPaths
        path.push new google.maps.LatLng(coord.latitude, coord.longitude)
      new google.maps.Polygon
        map: elevationMap
        path: path
        fillColor: '#00ff00'
        strokeColor: '#00cc00'
        draggable: false
        editable: false

    drawingOptions =
      drawingMode: google.maps.drawing.OverlayType.MARKER
      drawingControl: true
      drawingControlOptions:
        position: google.maps.ControlPosition.TOP_CENTER
        drawingModes: [ google.maps.drawing.OverlayType.MARKER ]
      markerOptions:
        animation: google.maps.Animation.DROP
        icon: '/assets/brown_MarkerA.png'
        draggable: true
    drawingManager = new google.maps.drawing.DrawingManager drawingOptions
    drawingManager.setMap elevationMap

    google.maps.event.addListener drawingManager, 'markercomplete', (marker) ->
      letter = $('#add-elevation-sample').data('char')
      marker.icon = "/assets/brown_Marker#{letter}.png"
      sample = $( $('#add-elevation-sample').data('content').replace('A', letter).replace('A', letter).replace('A', letter).replace('A', letter) )
      lat = sample.find('.latitude')
      lng = sample.find('.longitude')
      lat.val(marker.position.lat())
      lng.val(marker.position.lng())
      reposition = () ->
        marker.setPosition new google.maps.LatLng( lat.val(), lng.val() )
      lat.on 'change', reposition
      lng.on 'change', reposition
      $('#elevation-samples').append(sample)
      $('#add-elevation-sample').data('char', String.fromCharCode( letter.charCodeAt(0) + 1) )
      google.maps.event.addListener marker, 'dragend', () ->
        sample.find('.latitude').val(marker.position.lat())
        sample.find('.longitude').val(marker.position.lng())

    $('#add-elevation-sample').on 'click', () ->
      letter = $(this).data('char')
      sample = $( $('#add-elevation-sample').data('content').replace('A', letter).replace('A', letter).replace('A', letter).replace('A', letter) )
      $('#elevation-samples').append(sample)
      marker = new google.maps.Marker
        map: elevationMap
        position: location
        icon: "/assets/brown_Marker#{letter}.png"
        animation: google.maps.Animation.DROP
        draggable: true
      $(this).data('char', String.fromCharCode( letter.charCodeAt(0) + 1) )
      google.maps.event.addListener marker, 'dragend', () ->
        sample.find('.latitude').val(marker.position.lat())
        sample.find('.longitude').val(marker.position.lng())
      lat = sample.find('.latitude')
      lng = sample.find('.longitude')
      reposition = () ->
        marker.setPosition  new google.maps.LatLng( lat.val(), lng.val() )
      lat.on 'change', reposition
      lng.on 'change', reposition



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

    farm.field_bounds.forEach (bounds, i) ->
      path = []
      bounds.forEach (coord, j) ->
        farm.fieldPaths
        path.push new google.maps.LatLng(coord.latitude, coord.longitude)
      new google.maps.Polygon
        map: soilMap
        path: path
        fillColor: '#00ff00'
        strokeColor: '#00cc00'
        draggable: false
        editable: false

    farm.soil_samples.forEach (sample) ->
      letter = $('#add-soil-sample').data('char')
      row = $( $('#add-soil-sample').data('content').replace('A', letter).replace('A', letter).replace('A', letter).replace('A', letter) )
      lat = row.find('.latitude')
      lng = row.find('.longitude')
      lat.val(sample.latitude)
      lng.val(sample.longitude)
      $.each sample, (property) ->
        row.find(".modal input[name=#{property}]").val(sample[property])
      marker = new google.maps.Marker
        map: soilMap
        position: new google.maps.LatLng(sample.latitude, sample.longitude)
        icon: "/assets/brown_Marker#{letter}.png"
        draggable: true
      reposition = () ->
        marker.setPosition new google.maps.LatLng( lat.val(), lng.val() )
      lat.on 'change', reposition
      lng.on 'change', reposition      
      $('#soil-samples').append(row)
      $('#add-soil-sample').data('char', String.fromCharCode( letter.charCodeAt(0) + 1) )
      google.maps.event.addListener marker, 'dragend', () ->
        lat.val(marker.position.lat())
        lng.val(marker.position.lng())    

    drawingOptions =
      drawingMode: google.maps.drawing.OverlayType.MARKER
      drawingControl: true
      drawingControlOptions:
        position: google.maps.ControlPosition.TOP_CENTER
        drawingModes: [ google.maps.drawing.OverlayType.MARKER ]
      markerOptions:
        animation: google.maps.Animation.DROP
        icon: '/assets/brown_MarkerA.png'
        draggable: true
    drawingManager = new google.maps.drawing.DrawingManager drawingOptions
    drawingManager.setMap soilMap

    google.maps.event.addListener drawingManager, 'markercomplete', (marker) ->
      letter = $('#add-soil-sample').data('char')
      marker.icon = "/assets/brown_Marker#{letter}.png"
      sample = $( $('#add-soil-sample').data('content').replace('A', letter).replace('A', letter).replace('A', letter).replace('A', letter) )
      lat = sample.find('.latitude')
      lng = sample.find('.longitude')
      lat.val(marker.position.lat())
      lng.val(marker.position.lng())
      reposition = () ->
        marker.setPosition new google.maps.LatLng( lat.val(), lng.val() )
      lat.on 'change', reposition
      lng.on 'change', reposition      
      $('#soil-samples').append(sample)
      $('#add-soil-sample').data('char', String.fromCharCode( letter.charCodeAt(0) + 1) )
      google.maps.event.addListener marker, 'dragend', () ->
        sample.find('.latitude').val(marker.position.lat())
        sample.find('.longitude').val(marker.position.lng())

    $('#add-soil-sample').on 'click', () ->
      letter = $(this).data('char')
      sample = $( $('#add-soil-sample').data('content').replace('A', letter).replace('A', letter).replace('A', letter).replace('A', letter) )
      $('#soil-samples').append(sample) 
      marker = new google.maps.Marker
        map: soilMap
        position: location
        icon: "/assets/brown_Marker#{letter}.png"
        animation: google.maps.Animation.DROP
        draggable: true
      $(this).data('char', String.fromCharCode( letter.charCodeAt(0) + 1) )
      google.maps.event.addListener marker, 'dragend', () ->
        sample.find('.latitude').val(marker.position.lat())
        sample.find('.longitude').val(marker.position.lng())
      lat = sample.find('.latitude')
      lng = sample.find('.longitude')
      reposition = () ->
        marker.setPosition  new google.maps.LatLng( lat.val(), lng.val() )
      lat.on 'change', reposition
      lng.on 'change', reposition      



    # General map functions
    #-------------------------------

    panmap = () ->
      locationMapMarker.setPosition location
      fieldMapMarker.setPosition location
      elevationMapMarker.setPosition location
      soilMapMarker.setPosition location
      locationMap.panTo location
      fieldMap.panTo location
      elevationMap.panTo location
      soilMap.panTo location

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

    $('#elevation-tab').on 'click', (event) ->
      event.preventDefault()
      $(this).tab('show')
      resetMap elevationMap

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
      elevationMapMarker.setTitle farm.name
      soilMapMarker.setTitle farm.name
    
    $('#farm_latitude').on 'change', () -> 
      farm.latitude = $('#farm_latitude').val()
      panmap()

    $('#farm_longitude').on 'change', () ->
      farm.latitude = $('#farm_longitude').val()
      panmap()
    

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
        
    $('.farm-form').on 'submit', (event) ->

      # Submits can be triggered from the "search by address"
      # box, which is probably not the user intent
      if $('#address').is(":focus")
        searchByAddress()
        event.preventDefault()
        return false

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

      farm.soil_samples = []
      $('.soil-sample').each (i, row) ->
        sample = 
          latitude: $(row).find('.latitude').val()
          longitude: $(row).find('.longitude').val()
        $(row).find('.modal input').each (i, input) ->
          sample[$(input).attr('name')] = $(input).val()
        farm.soil_samples.push(sample)

      $('#farm_data').val( JSON.stringify(farm) )

