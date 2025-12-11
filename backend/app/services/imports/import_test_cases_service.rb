require "csv"
require "aws-sdk-s3"

module Imports
  # Imports CSV fixtures from an S3 prefix into the generic ImportedRow table.
  # This is intentionally schema-agnostic so we can ingest all provided sample data
  # before wiring specific domain models.
  class ImportTestCasesService
    DEFAULT_PREFIX = "s3://daybreak-dev-bucket/fixtures/daybreak-test-cases-2".freeze

    def initialize(s3_prefix = DEFAULT_PREFIX)
      @s3_prefix = s3_prefix.presence || DEFAULT_PREFIX
      @bucket, @prefix = parse_s3_path(@s3_prefix)
      @s3 = Aws::S3::Client.new(region: ENV.fetch("AWS_REGION", "us-east-1"))
    end

    def run
      puts "Importing test cases from #{@s3_prefix}"
      keys = list_csv_keys
      puts "Found #{keys.size} CSV files"

      keys.each do |key|
        import_key(key)
      end

      puts "Import complete"
    end

    private

    def list_csv_keys
      keys = []
      continuation_token = nil

      loop do
        resp = @s3.list_objects_v2(
          bucket: @bucket,
          prefix: @prefix,
          continuation_token: continuation_token
        )
        csv_objects = resp.contents.select { |obj| obj.key.ends_with?(".csv") }
        keys.concat(csv_objects.map(&:key))
        break unless resp.is_truncated

        continuation_token = resp.next_continuation_token
      end

      keys
    end

    def import_key(key)
      dataset = File.basename(key, ".csv")
      puts "\n== Importing #{dataset} (#{key})"

      body = @s3.get_object(bucket: @bucket, key: key).body.read
      imported = 0
      skipped = 0

      CSV.parse(body, headers: true) do |row|
        next if truthy?(row["_fivetran_deleted"])

        row_id = row["id"].presence || row["ID"].presence
        if row_id.blank?
          skipped += 1
          next
        end

        data_hash = row.to_h.except("_fivetran_deleted", "_fivetran_synced").compact

        ImportedRow.upsert(
          {
            dataset: dataset,
            row_id: row_id,
            data: data_hash,
            created_at: Time.current,
            updated_at: Time.current
          },
          unique_by: %i[dataset row_id]
        )

        imported += 1
        print "." if (imported % 25).zero?
      rescue StandardError => e
        skipped += 1
        puts "\nError on row #{row_id || '<no-id>'}: #{e.class} - #{e.message}"
      end

      puts "\nImported #{imported}, skipped #{skipped}"
    rescue Aws::S3::Errors::NoSuchKey
      puts "⚠ File not found in S3: #{key}"
    end

    def parse_s3_path(path)
      match = path.match(%r{\As3://([^/]+)/(.+)\z})
      raise ArgumentError, "Invalid S3 path: #{path}" unless match

      [match[1], match[2]]
    end

    def truthy?(value)
      value.to_s.downcase == "true"
    end
  end
end

