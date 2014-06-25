json.array!(@soils) do |soil|
  json.extract! soil, :id, :user_id, :name, :description, :code, :workspace
  json.url soil_url(soil, format: :json)
end
