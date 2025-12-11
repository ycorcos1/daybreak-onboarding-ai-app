require "json"
require "time"
require "bcrypt"
require "digest"

module Imports
  # Maps imported_rows data into domain tables in a FK-safe order.
  class MapSampleDataService
    PASSWORD_FALLBACK = "Temp123!".freeze

    def run
      # Reference-only import (no user accounts)
      map_organizations
      map_contracts
      map_org_contracts
      map_credentialed_insurances
      map_clinicians
      map_clinician_credentialed_insurances
      map_clinician_availabilities

      # Skipped (user-bound datasets)
      puts "Skipped user-bound datasets; mapping complete."
    end

    private

    def map_organizations
      puts "Mapping organizations..."
      rows = ImportedRow.where(dataset: "orgs")
      inserted = 0

      # Pass 1: roots (no parent)
      rows.select { |r| r.data["parent_organization_id"].blank? }.each do |row|
        data = row.data
        next if truthy?(data["_fivetran_deleted"])
        Organization.upsert(org_attrs(data), unique_by: :id)
        inserted += 1
      end

      # Pass 2: children whose parent now exists
      rows.select { |r| r.data["parent_organization_id"].present? }.each do |row|
        data = row.data
        next if truthy?(data["_fivetran_deleted"])
        parent_id = data["parent_organization_id"]
        next unless Organization.exists?(parent_id)
        Organization.upsert(org_attrs(data), unique_by: :id)
        inserted += 1
      end

      puts "\n✓ Mapped #{inserted} organizations (roots then children)"
    end

    def org_attrs(data)
      {
        id: data["id"],
        parent_organization_id: nil, # avoid FK issues; structure can be re-linked later if needed
        kind: data["kind"]&.to_i,
        slug: data["slug"],
        tzdb: data["tzdb"],
        name: data["name"],
        config: parse_json(data["config"]),
        market_id: data["market_id"].presence,
        internal_name: data["internal_name"],
        enabled_at: parse_timestamp(data["enabled_at"]),
        migration_details: parse_json(data["migration_details"]),
        created_at: parse_timestamp(data["created_at"]),
        updated_at: parse_timestamp(data["updated_at"])
      }.compact
    end

    def map_contracts
      puts "Mapping contracts..."
      count = 0
      ImportedRow.where(dataset: "contracts").find_each do |row|
        data = row.data
        next if truthy?(data["_fivetran_deleted"])

        Contract.upsert(
          {
            id: data["id"],
            services: parse_json(data["services"]),
            terms: data["terms"],
            contract_url: data["contract_url"],
            effective_date: parse_date(data["effective_date"]),
            end_date: parse_date(data["end_date"]),
            created_at: parse_timestamp(data["created_at"]),
            updated_at: parse_timestamp(data["updated_at"])
          }.compact,
          unique_by: :id
        )
        count += 1
      end
      puts "✓ Mapped #{count} contracts"
    end

    def map_org_contracts
      puts "Mapping org_contracts..."
      count = 0
      ImportedRow.where(dataset: "org_contracts").find_each do |row|
        data = row.data
        next if truthy?(data["_fivetran_deleted"])
        next unless Organization.exists?(data["organization_id"]) && Contract.exists?(data["contract_id"])

        OrgContract.upsert(
          {
            id: data["id"],
            organization_id: data["organization_id"],
            contract_id: data["contract_id"],
            created_at: parse_timestamp(data["created_at"]),
            updated_at: parse_timestamp(data["updated_at"])
          }.compact,
          unique_by: :id
        )
        count += 1
      end
      puts "✓ Mapped #{count} org_contracts"
    end

    def map_credentialed_insurances
      puts "Mapping credentialed_insurances..."
      count = 0
      ImportedRow.where(dataset: "credentialed_insurances").find_each do |row|
        data = row.data
        next if truthy?(data["_fivetran_deleted"])

        CredentialedInsurance.upsert(
          {
            id: data["id"],
            name: data["name"],
            state: data["state"],
            line_of_business: data["line_of_business"],
            network_status: data["network_status"],
            created_at: parse_timestamp(data["created_at"]),
            updated_at: parse_timestamp(data["updated_at"])
          }.compact,
          unique_by: :id
        )
        count += 1
      end
      puts "✓ Mapped #{count} credentialed_insurances"
    end

    def map_users_from_patients_guardians
      puts "Skipping users (patients/guardians) for demo (no account creation)."
    end

    def map_memberships
      puts "Skipping memberships (user-bound) for demo."
    end

    def map_kinships
      puts "Skipping kinships (user-bound) for demo."
    end

    def map_clinicians
      puts "Mapping clinicians (reference only, no accounts)..."
      count = 0
      ImportedRow.where(dataset: "clinicians_anonymized").find_each do |row|
        data = row.data
        next if truthy?(data["_fivetran_deleted"])

        profile_data = build_profile_data(data).merge(
          "healthie_id" => data["healthie_id"]&.to_s,
          "external_user_id" => data["user_id"]&.to_s
        ).compact

        Clinician.upsert(
          {
            id: data["id"],
            user_id: nil,
            first_name: data["first_name"],
            last_name: data["last_name"],
            email: data["email"] || data["email_1"],
            phone: data["phone"] || data["phone_number"],
            license_number: data["license_number"] || data["npi_number"],
            license_state: Array.wrap(data["licensed_states"]).join(","),
            credentials: data["credentials"],
            profile_data: profile_data,
            specialties: parse_json(data["specialties"]),
            active: interpret_active(data),
            created_at: parse_timestamp(data["created_at"]),
            updated_at: parse_timestamp(data["updated_at"])
          }.compact,
          unique_by: :id
        )
        count += 1
      end
      puts "✓ Mapped #{count} clinicians (no user accounts)"
    end

    def map_clinician_credentialed_insurances
      puts "Mapping clinician_credentialed_insurances..."
      count = 0
      ImportedRow.where(dataset: "clinician_credentialed_insurances").find_each do |row|
        data = row.data
        next if truthy?(data["_fivetran_deleted"])

        clinician_id = data["clinician_id"]
        cred_id = data["credentialed_insurance_id"]
        next unless Clinician.exists?(clinician_id) && CredentialedInsurance.exists?(cred_id)

        ClinicianCredentialedInsurance.upsert(
          {
            id: data["id"],
            clinician_id: clinician_id,
            credentialed_insurance_id: cred_id,
            created_at: parse_timestamp(data["created_at"]),
            updated_at: parse_timestamp(data["updated_at"])
          }.compact,
          unique_by: :id
        )
        count += 1
      end
      puts "✓ Mapped #{count} clinician_credentialed_insurances"
    end

    def map_clinician_availabilities
      puts "Mapping clinician_availabilities..."
      count = 0
      ImportedRow.where(dataset: "clinician_availabilities").find_each do |row|
        data = row.data
        next if truthy?(data["_fivetran_deleted"])

        clinician_healthie_id = data["user_id"] || data["clinician_id"]
        clinician = if clinician_healthie_id.present?
                      Clinician.find_by("profile_data ->> 'healthie_id' = ?", clinician_healthie_id.to_s)
                    else
                      Clinician.find_by(id: data["clinician_id"])
                    end
        next unless clinician

        start_at = parse_timestamp(data["range_start"] || data["start_time"])
        end_at = parse_timestamp(data["range_end"] || data["end_time"])
        start_time = start_at&.strftime("%H:%M:%S")
        end_time = end_at&.strftime("%H:%M:%S")
        day_of_week = data["day_of_week"]&.to_i

        availability_id = deterministic_uuid("clin_avail-#{data['id']}-#{clinician.id}-#{day_of_week}-#{start_time}-#{end_time}")

        ClinicianAvailability.upsert(
          {
            id: availability_id,
            clinician_id: clinician.id,
            day_of_week: day_of_week,
            start_time: start_time,
            end_time: end_time,
            timezone: data["timezone"] || "America/Los_Angeles",
            created_at: parse_timestamp(data["created_at"]),
            updated_at: parse_timestamp(data["updated_at"])
          }.compact,
          unique_by: :id
        )
        count += 1
      end
      puts "✓ Mapped #{count} clinician_availabilities"
    end

    def map_insurance_coverages
      puts "Skipping insurance_coverages (user-bound) for demo."
    end

    def map_referrals
      puts "Skipping referrals (user/child-bound) for demo."
    end

    def map_referral_members
      puts "Skipping referral_members (user-bound) for demo."
    end

    def map_patient_availabilities
      puts "Skipping patient_availabilities (user-bound) for demo."
    end

    def map_questionnaires
      puts "Skipping questionnaires (user-bound) for demo."
    end

    def map_documents
      puts "Skipping documents (user-bound) for demo."
    end

    # Helpers
    def find_user_by_external(external_id)
      return nil if external_id.blank?
      User.find_by(external_id: external_id)
    end

    def find_or_create_user_from_clinician(data)
      external_id = data["user_id"] || data["id"]
      user = User.find_by(external_id: external_id)
      return user if user

      digest = BCrypt::Password.create(PASSWORD_FALLBACK)
      User.create!(
        external_id: external_id,
        email: data["email"] || data["email_1"] || "clinician+#{external_id}@example.com",
        password_digest: digest,
        role: "clinician",
        name: data["full_name"] || [data["first_name"], data["last_name"]].compact.join(" ").strip,
        phone: data["phone"] || data["phone_number"],
        language_preference: Array.wrap(data["care_languages"]).join(","),
        first_name: data["first_name"],
        last_name: data["last_name"],
        full_name: data["full_name"],
        profile_data: build_profile_data(data)
      )
    end

    def parse_json(value)
      return {} if value.blank?
      return value if value.is_a?(Hash) || value.is_a?(Array)
      JSON.parse(value)
    rescue JSON::ParserError
      {}
    end

    def parse_timestamp(value)
      return nil if value.blank?
      Time.parse(value)
    rescue ArgumentError
      nil
    end

    def parse_date(value)
      return nil if value.blank?
      Date.parse(value)
    rescue ArgumentError
      nil
    end

    def parse_time_of_day(value)
      return nil if value.blank?
      Time.parse(value).strftime("%H:%M:%S")
    rescue ArgumentError
      nil
    end

    def truthy?(val)
      val.to_s.downcase == "true"
    end

    def infer_role(data)
      label = (data["role_label"] || "").downcase
      return "parent" if label.include?("guardian") || label.include?("parent")
      return "student" if label.include?("student") || label.include?("dependent")
      "parent"
    end

    def build_profile_data(data)
      data.slice("profile_data", "settings", "notes", "bio", "specialties", "modalities", "ethnicity").compact
    end

    def interpret_active(data)
      return true if data["active"] == true || data["care_provider_status"].to_s == "3"
      return false if data["care_provider_status"].to_s == "0"
      true
    end

    def deterministic_uuid(seed)
      hex = Digest::SHA1.hexdigest(seed.to_s)[0, 32]
      [hex[0..7], hex[8..11], hex[12..15], hex[16..19], hex[20..31]].join("-")
    end
  end
end

