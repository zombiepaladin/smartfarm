class CreateSoils < ActiveRecord::Migration
  def change
    create_table :soils do |t|
      t.integer :user_id
      t.string :name, default: "Unnamed soil"
      t.text :description
      t.text :code
      t.text :workspace, default: "<xml id=\"workspace\" style=\"display: none\"></xml>"

      t.timestamps
    end
  end
end
