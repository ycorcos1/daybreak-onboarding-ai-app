class CreateSupportChatMessages < ActiveRecord::Migration[7.2]
  def change
    create_table :support_chat_messages do |t|
      t.references :chat, null: false, foreign_key: { to_table: :support_chats }
      t.string :sender_type, null: false
      t.text :message_text, null: false
      t.jsonb :metadata_jsonb, null: false, default: {}

      t.timestamps
    end

    add_index :support_chat_messages, :sender_type
  end
end

