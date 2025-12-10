class CreateReferralPackets < ActiveRecord::Migration[7.2]
  def change
    create_table :referral_packets do |t|
      t.references :referral, null: false, foreign_key: true, index: { unique: true }
      t.jsonb :packet_jsonb
      t.string :pdf_s3_key

      t.timestamps
    end
  end
end

