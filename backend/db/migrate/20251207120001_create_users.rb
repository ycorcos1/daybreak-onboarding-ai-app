class CreateUsers < ActiveRecord::Migration[7.2]
  def change
    create_table :users do |t|
      t.string :email, null: false
      t.string :password_digest, null: false
      t.string :role, null: false, default: "parent"
      t.string :name, null: false
      t.string :phone
      t.text :address
      t.string :language_preference
      t.string :relationship_to_child

      t.timestamps
    end

    add_index :users, :email, unique: true
    add_index :users, :role
  end
end

