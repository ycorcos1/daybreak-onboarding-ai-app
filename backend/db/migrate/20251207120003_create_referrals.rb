class CreateReferrals < ActiveRecord::Migration[7.2]
  def change
    create_table :referrals do |t|
      t.references :child, null: false, foreign_key: true
      t.string :status, null: false, default: "draft"
      t.boolean :risk_flag, null: false, default: false
      t.string :last_completed_step
      t.datetime :last_updated_step_at
      t.string :packet_status, default: "not_generated"
      t.datetime :deletion_requested_at
      t.datetime :submitted_at
      t.datetime :withdrawn_at
      t.date :scheduled_date
      t.time :scheduled_time
      t.string :clinician_name
      t.string :session_type

      t.timestamps
    end

    add_index :referrals, :status
    add_index :referrals, :created_at
    add_index :referrals, :risk_flag
    add_index :referrals, :packet_status
    add_index :referrals, :session_type
    add_index :referrals,
              :status,
              where: "status IN ('draft', 'submitted', 'in_review')",
              name: "index_referrals_on_active_statuses"
  end
end

