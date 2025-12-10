# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2025_12_07_120016) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "ai_screener_sessions", force: :cascade do |t|
    t.bigint "referral_id", null: false
    t.jsonb "transcript_jsonb", default: [], null: false
    t.jsonb "summary_jsonb", default: {}, null: false
    t.boolean "risk_flag", default: false, null: false
    t.datetime "completed_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["referral_id"], name: "index_ai_screener_sessions_on_referral_id", unique: true
  end

  create_table "children", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "name", null: false
    t.date "dob"
    t.string "age_band"
    t.string "grade", null: false
    t.string "school_name", null: false
    t.string "district", null: false
    t.string "state"
    t.string "primary_language"
    t.string "pronouns"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_children_on_user_id"
  end

  create_table "consent_records", force: :cascade do |t|
    t.bigint "referral_id", null: false
    t.string "consent_type", null: false
    t.datetime "accepted_at", null: false
    t.inet "ip_address"
    t.text "user_agent"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["referral_id", "consent_type"], name: "index_consent_records_on_referral_id_and_consent_type", unique: true
    t.index ["referral_id"], name: "index_consent_records_on_referral_id"
  end

  create_table "cost_estimates", force: :cascade do |t|
    t.bigint "referral_id", null: false
    t.string "category"
    t.string "rule_key"
    t.text "explanation_text"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["referral_id"], name: "index_cost_estimates_on_referral_id", unique: true
  end

  create_table "insurance_details", force: :cascade do |t|
    t.bigint "referral_id", null: false
    t.string "insurance_status", null: false
    t.string "insurer_name"
    t.string "plan_name"
    t.string "member_id"
    t.string "group_id"
    t.string "policyholder_name"
    t.string "coverage_phone"
    t.string "coverage_website"
    t.string "source"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["referral_id"], name: "index_insurance_details_on_referral_id", unique: true
  end

  create_table "insurance_uploads", force: :cascade do |t|
    t.bigint "referral_id", null: false
    t.string "front_image_s3_key"
    t.string "back_image_s3_key"
    t.string "ocr_status"
    t.float "ocr_confidence"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["ocr_status"], name: "index_insurance_uploads_on_ocr_status"
    t.index ["referral_id"], name: "index_insurance_uploads_on_referral_id"
  end

  create_table "intake_responses", force: :cascade do |t|
    t.bigint "referral_id", null: false
    t.jsonb "responses", default: {}, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["referral_id"], name: "index_intake_responses_on_referral_id", unique: true
  end

  create_table "notifications", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "referral_id"
    t.string "notification_type", null: false
    t.jsonb "payload_jsonb", default: {}, null: false
    t.datetime "read_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["referral_id"], name: "index_notifications_on_referral_id"
    t.index ["user_id", "read_at"], name: "index_notifications_on_user_id_and_read_at"
    t.index ["user_id"], name: "index_notifications_on_user_id"
  end

  create_table "referral_notes", force: :cascade do |t|
    t.bigint "referral_id", null: false
    t.bigint "admin_user_id", null: false
    t.text "note_text", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["admin_user_id"], name: "index_referral_notes_on_admin_user_id"
    t.index ["referral_id"], name: "index_referral_notes_on_referral_id"
  end

  create_table "referral_packets", force: :cascade do |t|
    t.bigint "referral_id", null: false
    t.jsonb "packet_jsonb"
    t.string "pdf_s3_key"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["referral_id"], name: "index_referral_packets_on_referral_id", unique: true
  end

  create_table "referrals", force: :cascade do |t|
    t.bigint "child_id", null: false
    t.string "status", default: "draft", null: false
    t.boolean "risk_flag", default: false, null: false
    t.string "last_completed_step"
    t.datetime "last_updated_step_at"
    t.string "packet_status", default: "not_generated"
    t.datetime "deletion_requested_at"
    t.datetime "submitted_at"
    t.datetime "withdrawn_at"
    t.date "scheduled_date"
    t.time "scheduled_time"
    t.string "clinician_name"
    t.string "session_type"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["child_id"], name: "index_referrals_on_child_id"
    t.index ["created_at"], name: "index_referrals_on_created_at"
    t.index ["packet_status"], name: "index_referrals_on_packet_status"
    t.index ["risk_flag"], name: "index_referrals_on_risk_flag"
    t.index ["session_type"], name: "index_referrals_on_session_type"
    t.index ["status"], name: "index_referrals_on_active_statuses", where: "((status)::text = ANY ((ARRAY['draft'::character varying, 'submitted'::character varying, 'in_review'::character varying])::text[]))"
    t.index ["status"], name: "index_referrals_on_status"
  end

  create_table "resource_items", force: :cascade do |t|
    t.string "title", null: false
    t.text "body"
    t.string "url"
    t.string "resource_type", null: false
    t.string "tags", default: [], array: true
    t.boolean "published", default: false, null: false
    t.bigint "created_by_admin_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["created_by_admin_id"], name: "index_resource_items_on_created_by_admin_id"
    t.index ["published"], name: "index_resource_items_on_published"
    t.index ["tags"], name: "index_resource_items_on_tags", using: :gin
  end

  create_table "scheduling_preferences", force: :cascade do |t|
    t.bigint "referral_id", null: false
    t.string "timezone"
    t.string "location_preference"
    t.jsonb "windows", default: [], null: false
    t.jsonb "clinician_preferences", default: {}, null: false
    t.jsonb "suggested_windows", default: [], null: false
    t.date "preferred_start_date"
    t.string "frequency"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["frequency"], name: "index_scheduling_preferences_on_frequency"
    t.index ["location_preference"], name: "index_scheduling_preferences_on_location_preference"
    t.index ["referral_id"], name: "index_scheduling_preferences_on_referral_id", unique: true
  end

  create_table "support_chat_messages", force: :cascade do |t|
    t.bigint "chat_id", null: false
    t.string "sender_type", null: false
    t.text "message_text", null: false
    t.jsonb "metadata_jsonb", default: {}, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["chat_id"], name: "index_support_chat_messages_on_chat_id"
    t.index ["sender_type"], name: "index_support_chat_messages_on_sender_type"
  end

  create_table "support_chats", force: :cascade do |t|
    t.bigint "referral_id"
    t.bigint "parent_user_id", null: false
    t.string "mode"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["mode"], name: "index_support_chats_on_mode"
    t.index ["parent_user_id"], name: "index_support_chats_on_parent_user_id"
    t.index ["referral_id"], name: "index_support_chats_on_referral_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", null: false
    t.string "password_digest", null: false
    t.string "role", default: "parent", null: false
    t.string "name", null: false
    t.string "phone"
    t.text "address"
    t.string "language_preference"
    t.string "relationship_to_child"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["role"], name: "index_users_on_role"
  end

  add_foreign_key "ai_screener_sessions", "referrals"
  add_foreign_key "children", "users"
  add_foreign_key "consent_records", "referrals"
  add_foreign_key "cost_estimates", "referrals"
  add_foreign_key "insurance_details", "referrals"
  add_foreign_key "insurance_uploads", "referrals"
  add_foreign_key "intake_responses", "referrals"
  add_foreign_key "notifications", "referrals"
  add_foreign_key "notifications", "users"
  add_foreign_key "referral_notes", "referrals"
  add_foreign_key "referral_notes", "users", column: "admin_user_id"
  add_foreign_key "referral_packets", "referrals"
  add_foreign_key "referrals", "children"
  add_foreign_key "resource_items", "users", column: "created_by_admin_id"
  add_foreign_key "scheduling_preferences", "referrals"
  add_foreign_key "support_chat_messages", "support_chats", column: "chat_id"
  add_foreign_key "support_chats", "referrals"
  add_foreign_key "support_chats", "users", column: "parent_user_id"
end
