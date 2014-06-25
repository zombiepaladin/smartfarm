class CreateWeather < ActiveRecord::Migration
  def change
    create_table :weather do |t|
      t.integer :user_id
      t.string :name
      t.text :description, default: "Unamed Weather"
      t.text :code
      t.text :workspace, default: "<xml id=\"workspace\" style=\"display: none\"></xml>"

      t.timestamps
    end
  end
end
