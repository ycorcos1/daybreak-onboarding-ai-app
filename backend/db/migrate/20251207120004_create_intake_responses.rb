class CreateIntakeResponses < ActiveRecord::Migration[7.2]
  def change
    create_table :intake_responses do |t|
      t.references :referral, null: false, foreign_key: true, index: { unique: true }
      t.jsonb :responses, null: false, default: {}

      t.timestamps
    end
  end
end

