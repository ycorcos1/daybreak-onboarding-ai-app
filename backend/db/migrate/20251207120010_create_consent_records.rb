class CreateConsentRecords < ActiveRecord::Migration[7.2]
  def change
    create_table :consent_records do |t|
      t.references :referral, null: false, foreign_key: true
      t.string :consent_type, null: false
      t.datetime :accepted_at, null: false
      t.inet :ip_address
      t.text :user_agent

      t.timestamps
    end

    add_index :consent_records, [:referral_id, :consent_type], unique: true
  end
end

