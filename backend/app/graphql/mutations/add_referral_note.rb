module Mutations
  class AddReferralNote < Mutations::BaseMutation
    argument :referral_id, ID, required: true
    argument :note_text, String, required: true

    field :referral_note, Types::ReferralNoteType, null: true
    field :errors, [String], null: false

    def resolve(referral_id:, note_text:)
      require_admin!

      referral = Referral.find_by(id: referral_id)
      return { referral_note: nil, errors: ["Referral not found"] } unless referral

      note = referral.referral_notes.build(admin_user_id: current_user.id, note_text: note_text)

      if note.save
        { referral_note: note, errors: [] }
      else
        { referral_note: nil, errors: note.errors.full_messages }
      end
    end
  end
end


