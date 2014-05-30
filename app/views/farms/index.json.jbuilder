json.array!(@farms) do |farm|
  json.extract! farm, :id, :name, :latitude, :longitude, :fields
  json.url farm_url(farm, format: :json)
end
