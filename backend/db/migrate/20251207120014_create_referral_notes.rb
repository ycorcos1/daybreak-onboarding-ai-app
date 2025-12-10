class CreateReferralNotes < ActiveRecord::Migration[7.2]
  def change
    create_table :referral_notes do |t|
      t.references :referral, null: false, foreign_key: true
      t.references :admin_user, null: false, foreign_key: { to_table: :users }
      t.text :note_text, null: false

      t.timestamps
    end
  end
end

