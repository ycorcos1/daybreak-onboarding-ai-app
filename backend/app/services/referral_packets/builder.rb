module ReferralPackets
  # Assembles the full referral packet JSON from associated records.
  class Builder
    def initialize(referral)
      @referral = referral
      @user = referral.user
      @child = referral.child
    end

    def build
      {
        header: header_section,
        parent: parent_section,
        child: child_section,
        screener_summary: screener_section,
        clinical_intake: clinical_intake_section,
        insurance: insurance_section,
        cost_estimate: cost_section,
        scheduling: scheduling_section,
        consents: consents_section,
        chat_notes: chat_notes_section,
        internal_notes: internal_notes_section
      }.compact
    end

    private

    attr_reader :referral, :user, :child

    def header_section
      {
        referral_id: referral.id,
        status: referral.status,
        packet_status: referral.packet_status,
        risk_flag: referral.risk_flag || referral.ai_screener_session&.risk_flag,
        created_at: timestamp(referral.created_at),
        submitted_at: timestamp(referral.submitted_at),
        last_completed_step: referral.last_completed_step,
        last_updated_step_at: timestamp(referral.last_updated_step_at)
      }
    end

    def parent_section
      return nil unless user

      {
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        relationship_to_child: user.relationship_to_child,
        language_preference: user.language_preference
      }
    end

    def child_section
      return nil unless child

      {
        name: child.name,
        dob: child.dob,
        age_band: child.age_band,
        grade: child.grade,
        school_name: child.school_name,
        district: child.district,
        state: child.state,
        primary_language: child.primary_language,
        pronouns: child.pronouns
      }
    end

    def screener_section
      session = referral.ai_screener_session
      return nil unless session

      {
        risk_flag: session.risk_flag,
        transcript: session.transcript_jsonb,
        summary: session.summary_jsonb,
        completed_at: timestamp(session.completed_at)
      }
    end

    def clinical_intake_section
      intake = referral.intake_response
      return nil unless intake

      {
        responses: intake.responses,
        updated_at: timestamp(intake.updated_at)
      }
    end

    def insurance_section
      detail = referral.insurance_detail
      uploads = referral.insurance_uploads

      return nil unless detail || uploads.any?

      {
        insurance_status: detail&.insurance_status,
        insurer_name: detail&.insurer_name,
        plan_name: detail&.plan_name,
        member_id: detail&.member_id,
        group_id: detail&.group_id,
        policyholder_name: detail&.policyholder_name,
        coverage_phone: detail&.coverage_phone,
        coverage_website: detail&.coverage_website,
        source: detail&.source,
        uploads: uploads.map do |upload|
          {
            front_image_s3_key: upload.front_image_s3_key,
            back_image_s3_key: upload.back_image_s3_key,
            ocr_status: upload.ocr_status,
            ocr_confidence: upload.ocr_confidence,
            uploaded_at: timestamp(upload.created_at)
          }
        end
      }
    end

    def cost_section
      estimate = referral.cost_estimate
      return nil unless estimate

      {
        category: estimate.category,
        rule_key: estimate.rule_key,
        explanation_text: estimate.explanation_text,
        disclaimer: "This is an estimate only. Final determination will be made by Daybreak."
      }
    end

    def scheduling_section
      preference = referral.scheduling_preference
      return nil unless preference

      {
        timezone: preference.timezone,
        location_preference: preference.location_preference,
        windows: preference.windows,
        clinician_preferences: preference.clinician_preferences,
        suggested_windows: preference.suggested_windows,
        preferred_start_date: preference.preferred_start_date,
        frequency: preference.frequency
      }
    end

    def consents_section
      referral.consent_records.map do |consent|
        {
          consent_type: consent.consent_type,
          accepted_at: timestamp(consent.accepted_at),
          ip_address: consent.ip_address,
          user_agent: consent.user_agent
        }
      end
    end

    def chat_notes_section
      referral.support_chats.includes(:support_chat_messages).map do |chat|
        {
          chat_id: chat.id,
          mode: chat.mode,
          created_at: timestamp(chat.created_at),
          referral_id: chat.referral_id,
          message_count: chat.support_chat_messages.size,
          messages: chat.support_chat_messages.order(:created_at).map do |message|
            {
              sender_type: message.sender_type,
              text: message.message_text,
              metadata: message.metadata_jsonb,
              created_at: timestamp(message.created_at)
            }
          end
        }
      end
    end

    def internal_notes_section
      referral.referral_notes.includes(:admin_user).order(:created_at).map do |note|
        {
          admin: note.admin_user&.name,
          note_text: note.note_text,
          created_at: timestamp(note.created_at)
        }
      end
    end

    def timestamp(value)
      value&.iso8601
    end
  end
end