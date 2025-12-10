class CreateInsuranceUploads < ActiveRecord::Migration[7.2]
  def change
    create_table :insurance_uploads do |t|
      t.references :referral, null: false, foreign_key: true
      t.string :front_image_s3_key
      t.string :back_image_s3_key
      t.string :ocr_status
      t.float :ocr_confidence

      t.timestamps
    end

    add_index :insurance_uploads, :ocr_status
  end
end

