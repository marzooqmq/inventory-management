package com.way2care.inventorymanagement.util;

import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;

public class ReportsFontProvider {

    private static final String REGULAR = "fonts/Calibri/calibri.ttf";
    private static final String BOLD = "fonts/Calibri/calibrib.ttf";

    public PdfFont regular() {
        try {
            return PdfFontFactory.createFont(
                    REGULAR,
                    PdfFontFactory.EmbeddingStrategy.PREFER_EMBEDDED);
        } catch (Exception e) {
            throw new RuntimeException("Error loading Calibri regular font", e);
        }
    }

    public PdfFont bold() {
        try {
            return PdfFontFactory.createFont(
                    BOLD,
                    PdfFontFactory.EmbeddingStrategy.PREFER_EMBEDDED);
        } catch (Exception e) {
            throw new RuntimeException("Error loading Calibri bold font", e);
        }
    }
}
