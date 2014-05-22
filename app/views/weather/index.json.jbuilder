json.array!(@weather) do |weather|
  json.extract! weather, :id, :name, :description, :code, :workspace
  json.url weather_url(weather, format: :json)
end
