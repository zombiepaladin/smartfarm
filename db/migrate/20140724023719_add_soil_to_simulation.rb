class AddSoilToSimulation < ActiveRecord::Migration
  def change
    add_column :simulations, :soil_id, :integer
  end
end
