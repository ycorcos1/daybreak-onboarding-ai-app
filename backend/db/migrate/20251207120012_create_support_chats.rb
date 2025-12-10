class CreateSupportChats < ActiveRecord::Migration[7.2]
  def change
    create_table :support_chats do |t|
      t.references :referral, foreign_key: true
      t.references :parent_user, null: false, foreign_key: { to_table: :users }
      t.string :mode

      t.timestamps
    end

    add_index :support_chats, :mode
  end
end

