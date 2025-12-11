class Questionnaire < ApplicationRecord
  belongs_to :subject, class_name: "User"
  belongs_to :respondent, class_name: "User", optional: true
end

