class Kinship < ApplicationRecord
  belongs_to :guardian, class_name: "User"
  belongs_to :student, class_name: "User"
end

