class CreateCrops < ActiveRecord::Migration
  def change
    create_table :crops do |t|
      t.integer :user_id
      t.string :name, default: "Unnamed Crop"
      t.text :description
      t.text :code

      t.timestamps
    end
  end
end
