class AddSampleFieldsToUsersAndReferrals < ActiveRecord::Migration[7.2]
  def change
    add_column :users, :external_id, :uuid unless column_exists?(:users, :external_id)
    add_column :users, :healthie_id, :string unless column_exists?(:users, :healthie_id)
    add_column :users, :first_name, :string unless column_exists?(:users, :first_name)
    add_column :users, :last_name, :string unless column_exists?(:users, :last_name)
    add_column :users, :full_name, :string unless column_exists?(:users, :full_name)
    add_column :users, :birthdate, :date unless column_exists?(:users, :birthdate)
    add_column :users, :gender, :string unless column_exists?(:users, :gender)
    add_column :users, :profile_data, :jsonb, default: {} unless column_exists?(:users, :profile_data)
    add_index :users, :external_id, unique: true if column_exists?(:users, :external_id)
    add_index :users, :healthie_id if column_exists?(:users, :healthie_id)

    add_column :referrals, :external_id, :uuid unless column_exists?(:referrals, :external_id)
    add_column :referrals, :submitter_external_id, :uuid unless column_exists?(:referrals, :submitter_external_id)
    add_column :referrals, :organization_id, :uuid unless column_exists?(:referrals, :organization_id)
    add_column :referrals, :contract_id, :uuid unless column_exists?(:referrals, :contract_id)
    add_column :referrals, :service_kind, :integer unless column_exists?(:referrals, :service_kind)
    add_column :referrals, :concerns, :text unless column_exists?(:referrals, :concerns)
    add_column :referrals, :system_labels, :jsonb, default: [] unless column_exists?(:referrals, :system_labels)
    add_column :referrals, :tzdb, :string unless column_exists?(:referrals, :tzdb)

    add_index :referrals, :external_id if column_exists?(:referrals, :external_id)
    add_index :referrals, :organization_id if column_exists?(:referrals, :organization_id)
    add_index :referrals, :contract_id if column_exists?(:referrals, :contract_id)

    add_foreign_key :referrals, :organizations, column: :organization_id if column_exists?(:referrals, :organization_id)
    add_foreign_key :referrals, :contracts, column: :contract_id if column_exists?(:referrals, :contract_id)
  end
end

