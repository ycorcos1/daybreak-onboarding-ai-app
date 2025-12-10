module ReferralPackets
  # Renders the referral packet JSON into a PDF via WickedPdf.
  class PdfRenderer
    def initialize(packet_json)
      @packet_json = packet_json
    end

    def render
      WickedPdf.new.pdf_from_string(
        ApplicationController.render(
          template: "referral_packet/show",
          assigns: { packet: packet_json }
        )
      )
    end

    private

    attr_reader :packet_json
  end
end
