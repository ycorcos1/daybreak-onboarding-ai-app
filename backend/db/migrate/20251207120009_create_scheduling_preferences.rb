class CreateSchedulingPreferences < ActiveRecord::Migration[7.2]
  def change
    create_table :scheduling_preferences do |t|
      t.references :referral, null: false, foreign_key: true, index: { unique: true }
      t.string :timezone
      t.string :location_preference
      t.jsonb :windows, null: false, default: []
      t.jsonb :clinician_preferences, null: false, default: {}
      t.jsonb :suggested_windows, null: false, default: []
      t.date :preferred_start_date
      t.string :frequency

      t.timestamps
    end

    add_index :scheduling_preferences, :location_preference
    add_index :scheduling_preferences, :frequency
  end
end

