namespace :daybreak do
  desc "Map imported sample data from imported_rows into domain tables"
  task map_sample_data: :environment do
    Imports::MapSampleDataService.new.run
  end
end

