package com.way2care.inventorymanagement.util;

import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;

public class InvoiceFontProvider {

    private final PdfFont regular;
    private final PdfFont bold;

    public InvoiceFontProvider() {
        try {
            this.regular = PdfFontFactory.createFont(
                    InvoiceFontProvider.class
                            .getResourceAsStream("/fonts/Inter/static/Inter_18pt-Regular.ttf")
                            .readAllBytes(),
                    PdfFontFactory.EmbeddingStrategy.PREFER_EMBEDDED
            );

            this.bold = PdfFontFactory.createFont(
                    InvoiceFontProvider.class
                            .getResourceAsStream("/fonts/Inter/static/Inter_18pt-SemiBold.ttf")
                            .readAllBytes(),
                    PdfFontFactory.EmbeddingStrategy.PREFER_EMBEDDED
            );
        } catch (Exception e) {
            throw new RuntimeException("Failed to load fonts", e);
        }
    }

    public PdfFont regular() {
        return regular;
    }

    public PdfFont bold() {
        return bold;
    }
}
