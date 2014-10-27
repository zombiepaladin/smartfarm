class AddFarmToSimulation < ActiveRecord::Migration
  def change
    add_column :simulations, :farm_id, :integer
  end
end
