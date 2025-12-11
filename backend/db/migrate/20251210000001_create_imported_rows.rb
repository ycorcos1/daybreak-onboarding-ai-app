class CreateImportedRows < ActiveRecord::Migration[7.2]
  def change
    create_table :imported_rows do |t|
      t.string :dataset, null: false
      t.string :row_id, null: false
      t.jsonb :data, null: false, default: {}

      t.timestamps
    end

    add_index :imported_rows, [:dataset, :row_id], unique: true
    add_index :imported_rows, :dataset
  end
end

