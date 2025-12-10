class CreateResourceItems < ActiveRecord::Migration[7.2]
  def change
    create_table :resource_items do |t|
      t.string :title, null: false
      t.text :body
      t.string :url
      t.string :resource_type, null: false
      t.string :tags, array: true, default: []
      t.boolean :published, null: false, default: false
      t.references :created_by_admin, foreign_key: { to_table: :users }

      t.timestamps
    end

    add_index :resource_items, :published
    add_index :resource_items, :tags, using: :gin
  end
end

