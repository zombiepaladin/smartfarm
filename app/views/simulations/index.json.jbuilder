json.array!(@simulations) do |simulation|
  json.extract! simulation, :id, :user_id, :name, :start_on, :end_on, :description
  json.url simulation_url(simulation, format: :json)
end
