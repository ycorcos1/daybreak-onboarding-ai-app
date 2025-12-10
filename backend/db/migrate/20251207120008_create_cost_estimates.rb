class CreateCostEstimates < ActiveRecord::Migration[7.2]
  def change
    create_table :cost_estimates do |t|
      t.references :referral, null: false, foreign_key: true, index: { unique: true }
      t.string :category
      t.string :rule_key
      t.text :explanation_text

      t.timestamps
    end
  end
end

