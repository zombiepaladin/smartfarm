class AddStateToSimulation < ActiveRecord::Migration
  def change
    add_column :simulations, :state, :text
  end
end
