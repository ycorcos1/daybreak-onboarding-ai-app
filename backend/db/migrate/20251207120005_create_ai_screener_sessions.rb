class CreateAiScreenerSessions < ActiveRecord::Migration[7.2]
  def change
    create_table :ai_screener_sessions do |t|
      t.references :referral, null: false, foreign_key: true, index: { unique: true }
      t.jsonb :transcript_jsonb, null: false, default: []
      t.jsonb :summary_jsonb, null: false, default: {}
      t.boolean :risk_flag, null: false, default: false
      t.datetime :completed_at

      t.timestamps
    end
  end
end

