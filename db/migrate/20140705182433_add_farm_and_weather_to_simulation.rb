class AddFarmAndWeatherToSimulation < ActiveRecord::Migration
  def change
    add_column :simulations, :farm, :string
    add_column :simulations, :weather, :string
  end
end
