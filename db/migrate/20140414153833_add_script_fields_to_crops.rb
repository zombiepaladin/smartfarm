class AddScriptFieldsToCrops < ActiveRecord::Migration
  def change
    add_column :crops, :variables, :text
    add_column :crops, :scripts, :text
  end
end
