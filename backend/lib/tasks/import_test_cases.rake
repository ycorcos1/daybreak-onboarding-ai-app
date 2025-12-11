namespace :daybreak do
  desc "Import Daybreak Health test case CSVs from S3 into ImportedRow"
  task :import_test_cases, [:s3_prefix] => :environment do |_t, args|
    prefix = args[:s3_prefix].presence || ENV["TEST_CASES_S3_PREFIX"] || Imports::ImportTestCasesService::DEFAULT_PREFIX
    Imports::ImportTestCasesService.new(prefix).run
  end
end

