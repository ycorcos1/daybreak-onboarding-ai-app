class CreateNotifications < ActiveRecord::Migration[7.2]
  def change
    create_table :notifications do |t|
      t.references :user, null: false, foreign_key: true
      t.references :referral, foreign_key: true
      t.string :notification_type, null: false
      t.jsonb :payload_jsonb, null: false, default: {}
      t.datetime :read_at

      t.timestamps
    end

    add_index :notifications, [:user_id, :read_at]
  end
end

