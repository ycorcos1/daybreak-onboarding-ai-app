class CreateChildren < ActiveRecord::Migration[7.2]
  def change
    create_table :children do |t|
      t.references :user, null: false, foreign_key: true
      t.string :name, null: false
      t.date :dob
      t.string :age_band
      t.string :grade, null: false
      t.string :school_name, null: false
      t.string :district, null: false
      t.string :state
      t.string :primary_language
      t.string :pronouns

      t.timestamps
    end
  end
end

