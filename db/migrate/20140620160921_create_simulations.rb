class CreateSimulations < ActiveRecord::Migration
  def change
    create_table :simulations do |t|
      t.integer :user_id
      t.string :name
      t.date :start_on
      t.date :end_on
      t.text :description

      t.timestamps
    end
  end
end
