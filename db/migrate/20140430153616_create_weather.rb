class CreateWeather < ActiveRecord::Migration
  def change
    create_table :weather do |t|
      t.integer :user_id
      t.string :name
      t.text :description, default: "Unamed Weather"
      t.text :code
      t.text :workspace, default: '<block type="weather"></block>'

      t.timestamps
    end
  end
end
