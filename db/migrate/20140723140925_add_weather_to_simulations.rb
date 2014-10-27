class AddWeatherToSimulations < ActiveRecord::Migration
  def change
    add_column :simulations, :weather_id, :integer
  end
end
