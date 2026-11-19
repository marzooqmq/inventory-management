package com.way2care.inventorymanagement.util;

import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.events.Event;
import com.itextpdf.kernel.events.IEventHandler;
import com.itextpdf.kernel.events.PdfDocumentEvent;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.geom.Rectangle;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.canvas.PdfCanvas;
import com.itextpdf.layout.Canvas;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.way2care.inventorymanagement.model.CompanyProfile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class ReportsPdfUtil {

    private static final DeviceRgb GREEN = new DeviceRgb(26, 153, 86);
    private static final DeviceRgb DARK_GRAY = new DeviceRgb(107, 114, 128);

    /* ================= HEADER ================= */
    public static void addHeader(
            PdfDocument pdf,
            CompanyProfile profile,
            PdfFont regular,
            PdfFont bold) {
        pdf.addEventHandler(PdfDocumentEvent.START_PAGE,
                new HeaderHandler(profile, regular, bold));
    }

    /* ================= FOOTER ================= */
    public static void addFooter(PdfDocument pdf, PdfFont regular) {
        pdf.addEventHandler(PdfDocumentEvent.END_PAGE,
                new FooterHandler(regular));
    }

    /* ================= HEADER HANDLER ================= */
    static class HeaderHandler implements IEventHandler {
        private final CompanyProfile profile;
        private final PdfFont regular;
        private final PdfFont bold;

        HeaderHandler(CompanyProfile profile, PdfFont regular, PdfFont bold) {
            this.profile = profile;
            this.regular = regular;
            this.bold = bold;
        }

        @Override
        public void handleEvent(Event event) {
            PdfDocumentEvent documentEvent = (PdfDocumentEvent) event;
            Rectangle pageSize = documentEvent.getPage().getPageSize();

            PdfCanvas pdfCanvas = new PdfCanvas(documentEvent.getPage());
            Canvas canvas = new Canvas(pdfCanvas, pageSize);

            Table header = new Table(new float[]{1, 4, 2});
            header.setWidth(UnitValue.createPercentValue(100));

            // LOGO
            if (profile.getLogoUrl() != null) {
                Image logo = new Image(
                        ImageDataFactory.create(
                                getClass().getClassLoader().getResource(profile.getLogoUrl())))
                        .setWidth(60);
                header.addCell(new Cell().add(logo).setBorder(Border.NO_BORDER));
            } else {
                header.addCell(new Cell().setBorder(Border.NO_BORDER));
            }

            // COMPANY DETAILS
            Cell details = new Cell().setBorder(Border.NO_BORDER);
            details.add(new Paragraph(profile.getCompanyName())
                    .setFont(bold).setFontSize(10.5f));
            details.add(new Paragraph(profile.getAddressLine1())
                    .setFont(regular).setFontSize(8.5f));
            details.add(new Paragraph(profile.getCity() + ", " + profile.getState() +
                    " - " + profile.getZipCode())
                    .setFont(regular).setFontSize(8.5f));
            details.add(new Paragraph("Ph: "+ profile.getPhoneNumber())
                    .setFont(regular).setFontSize(8f));
            header.addCell(details);

            // GENERATED AT
            String generatedOn = "Generated on: " +
                    LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy | hh:mm a"));

            header.addCell(new Cell()
                    .add(new Paragraph(generatedOn)
                            .setFont(regular)
                            .setFontSize(8f))
                    .setTextAlignment(TextAlignment.RIGHT)
                    .setBorder(Border.NO_BORDER)
                    .setFontColor(DARK_GRAY));

            header.setFixedPosition(
                    pageSize.getLeft() + 36,
                    pageSize.getTop() - 70,
                    pageSize.getWidth() - 72);

            canvas.add(header);

            // LINE
            pdfCanvas.setStrokeColor(DARK_GRAY);
            pdfCanvas.setLineWidth(0.6f);
            pdfCanvas.moveTo(pageSize.getLeft() + 36, pageSize.getTop() - 75);
            pdfCanvas.lineTo(pageSize.getRight() - 36, pageSize.getTop() - 75);
            pdfCanvas.stroke();

            canvas.close();
        }
    }

    /* ================= FOOTER HANDLER ================= */
    static class FooterHandler implements IEventHandler {
        private final PdfFont regular;

        FooterHandler(PdfFont regular) {
            this.regular = regular;
        }

        @Override
        public void handleEvent(Event event) {
            PdfDocumentEvent docEvent = (PdfDocumentEvent) event;
            int pageNo = docEvent.getDocument().getPageNumber(docEvent.getPage());

            Rectangle page = docEvent.getPage().getPageSize();
            Canvas canvas = new Canvas(
                    new PdfCanvas(docEvent.getPage()),
                    page
            );

            canvas.showTextAligned(
                    new Paragraph(String.valueOf(pageNo))
                            .setFont(regular)
                            .setFontSize(8)
                                    .setFontColor(DARK_GRAY),
                    page.getWidth() / 2,
                    page.getBottom() + 20,
                    TextAlignment.CENTER);

            canvas.close();
        }
    }
}
