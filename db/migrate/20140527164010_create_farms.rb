class CreateFarms < ActiveRecord::Migration
  def change
    create_table :farms do |t|
      t.integer :user_id
      t.string :name
      t.text :description
      t.float :latitude
      t.float :longitude
      t.text :data

      t.timestamps
    end
  end
end
