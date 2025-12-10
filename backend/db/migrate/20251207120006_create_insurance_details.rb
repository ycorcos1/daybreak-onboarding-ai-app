class CreateInsuranceDetails < ActiveRecord::Migration[7.2]
  def change
    create_table :insurance_details do |t|
      t.references :referral, null: false, foreign_key: true, index: { unique: true }
      t.string :insurance_status, null: false
      t.string :insurer_name
      t.string :plan_name
      t.string :member_id
      t.string :group_id
      t.string :policyholder_name
      t.string :coverage_phone
      t.string :coverage_website
      t.string :source

      t.timestamps
    end
  end
end

