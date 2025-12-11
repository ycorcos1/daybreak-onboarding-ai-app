class CreateSampleDataTables < ActiveRecord::Migration[7.2]
  def change
    enable_extension "pgcrypto" unless extension_enabled?("pgcrypto")

    create_table :organizations, id: :uuid do |t|
      t.uuid :parent_organization_id
      t.integer :kind
      t.string :slug
      t.string :tzdb
      t.string :name
      t.jsonb :config, default: {}
      t.uuid :market_id
      t.string :internal_name
      t.timestamp :enabled_at
      t.jsonb :migration_details, default: {}

      t.timestamps
      t.index :parent_organization_id
      t.index :slug, unique: true
      t.index :kind
    end
    add_foreign_key :organizations, :organizations, column: :parent_organization_id

    create_table :contracts, id: :uuid do |t|
      t.jsonb :services, default: []
      t.text :terms
      t.string :contract_url
      t.date :effective_date
      t.date :end_date

      t.timestamps
      t.index :effective_date
      t.index :end_date
    end

    create_table :org_contracts, id: :uuid do |t|
      t.uuid :organization_id, null: false
      t.uuid :contract_id, null: false

      t.timestamps
      t.index [:organization_id, :contract_id], unique: true
    end
    add_foreign_key :org_contracts, :organizations
    add_foreign_key :org_contracts, :contracts

    create_table :credentialed_insurances, id: :uuid do |t|
      t.string :name, null: false
      t.string :state
      t.string :line_of_business
      t.string :network_status

      t.timestamps
      t.index :name
      t.index :state
    end

    create_table :clinicians, id: :uuid do |t|
      t.bigint :user_id
      t.string :first_name
      t.string :last_name
      t.string :email
      t.string :phone
      t.string :license_number
      t.string :license_state
      t.string :credentials
      t.jsonb :profile_data, default: {}
      t.jsonb :specialties, default: []
      t.boolean :active, default: true

      t.timestamps
      t.index :user_id
      t.index :email
      t.index :active
      t.index :license_state
    end
    add_foreign_key :clinicians, :users, column: :user_id

    create_table :clinician_credentialed_insurances, id: :uuid do |t|
      t.uuid :clinician_id, null: false
      t.uuid :credentialed_insurance_id, null: false

      t.timestamps
      t.index [:clinician_id, :credentialed_insurance_id], unique: true, name: "index_clinician_insurances"
    end
    add_foreign_key :clinician_credentialed_insurances, :clinicians
    add_foreign_key :clinician_credentialed_insurances, :credentialed_insurances

    create_table :clinician_availabilities, id: :uuid do |t|
      t.uuid :clinician_id, null: false
      t.integer :day_of_week
      t.time :start_time
      t.time :end_time
      t.string :timezone

      t.timestamps
      t.index :clinician_id
      t.index :day_of_week
    end
    add_foreign_key :clinician_availabilities, :clinicians

    create_table :memberships, id: :uuid do |t|
      t.bigint :user_id, null: false
      t.uuid :organization_id, null: false

      t.timestamps
      t.index [:user_id, :organization_id], unique: true
    end
    add_foreign_key :memberships, :users
    add_foreign_key :memberships, :organizations

    create_table :kinships, id: :uuid do |t|
      t.bigint :guardian_id, null: false
      t.bigint :student_id, null: false
      t.string :relationship

      t.timestamps
      t.index [:guardian_id, :student_id], unique: true
    end
    add_foreign_key :kinships, :users, column: :guardian_id
    add_foreign_key :kinships, :users, column: :student_id

    create_table :referral_members, id: :uuid do |t|
      t.bigint :referral_id, null: false
      t.bigint :user_id, null: false
      t.string :grade

      t.timestamps
      t.index [:referral_id, :user_id], unique: true
    end
    add_foreign_key :referral_members, :referrals
    add_foreign_key :referral_members, :users

    create_table :patient_availabilities, id: :uuid do |t|
      t.bigint :user_id, null: false
      t.integer :day_of_week
      t.time :start_time
      t.time :end_time
      t.string :timezone

      t.timestamps
      t.index :user_id
      t.index :day_of_week
    end
    add_foreign_key :patient_availabilities, :users

    create_table :insurance_coverages, id: :uuid do |t|
      t.bigint :user_id, null: false
      t.uuid :credentialed_insurance_id
      t.string :insurance_company_name
      t.string :policy_holder_name
      t.string :plan_name
      t.string :member_id
      t.string :group_number
      t.boolean :eligibility_verified, default: false
      t.boolean :in_network, default: false
      t.boolean :out_of_network, default: false

      t.timestamps
      t.index :user_id
      t.index :credentialed_insurance_id
    end
    add_foreign_key :insurance_coverages, :users
    add_foreign_key :insurance_coverages, :credentialed_insurances, column: :credentialed_insurance_id

    create_table :questionnaires, id: :uuid do |t|
      t.bigint :subject_id, null: false
      t.bigint :respondent_id
      t.float :score
      t.string :questionnaire_type
      t.jsonb :question_answers, default: {}
      t.timestamp :started_at
      t.timestamp :completed_at
      t.string :language_of_completion

      t.timestamps
      t.index :subject_id
      t.index :respondent_id
      t.index :completed_at
    end
    add_foreign_key :questionnaires, :users, column: :subject_id
    add_foreign_key :questionnaires, :users, column: :respondent_id

    create_table :documents, id: :uuid do |t|
      t.bigint :user_id, null: false
      t.string :document_type
      t.string :document_url
      t.string :filename

      t.timestamps
      t.index :user_id
      t.index :document_type
    end
    add_foreign_key :documents, :users
  end
end

