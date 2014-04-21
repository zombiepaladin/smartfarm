json.array!(@crops) do |crop|
  json.extract! crop, :id, :user_id, :name, :description, :code
  json.url crop_url(crop, format: :json)
end
