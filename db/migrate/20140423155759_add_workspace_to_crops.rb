class AddWorkspaceToCrops < ActiveRecord::Migration
  def change
    add_column :crops, :workspace, :text
  end
end
