import os
import io
from datetime import datetime
from typing import Dict, Any
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

class PDFService:
    def generate_interview_report_pdf(self, report_data: Dict[str, Any]) -> io.BytesIO:
        """Generate a crisp, multi-page professional PDF evaluation report."""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()
        
        # Custom Typography
        title_style = ParagraphStyle(
            'ReportTitle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=22,
            leading=26,
            textColor=colors.HexColor('#1e3a8a')
        )
        
        subtitle_style = ParagraphStyle(
            'ReportSubtitle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=11,
            leading=14,
            textColor=colors.HexColor('#475569')
        )
        
        section_heading = ParagraphStyle(
            'SectionHeading',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=13,
            leading=16,
            textColor=colors.HexColor('#0f172a'),
            spaceBefore=10,
            spaceAfter=6
        )
        
        body_style = ParagraphStyle(
            'ReportBody',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9.5,
            leading=13,
            textColor=colors.HexColor('#334155')
        )

        badge_style = ParagraphStyle(
            'BadgeStyle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=16,
            leading=18,
            alignment=TA_CENTER,
            textColor=colors.HexColor('#2563eb')
        )

        story = []

        # Header with branding
        candidate_name = report_data.get("candidate_name", "Candidate")
        company = report_data.get("company", "Target Company")
        role = report_data.get("role", "Target Role")
        domain = report_data.get("domain", "Domain")
        date_str = datetime.utcnow().strftime("%B %d, %Y")
        overall_score = report_data.get("overall_score", 0.0)

        header_table_data = [
            [
                Paragraph("<b>EcoSphere</b> | AI Evaluation Dossier", title_style),
                Paragraph(f"<b>Date:</b> {date_str}", ParagraphStyle('RightText', parent=body_style, alignment=TA_RIGHT))
            ],
            [
                Paragraph(f"Candidate: <b>{candidate_name}</b> | Role: <b>{role}</b> ({domain}) @ <b>{company}</b>", subtitle_style),
                Paragraph(f"Overall Score: <b>{overall_score:.1f}/100</b>", ParagraphStyle('ScoreHead', parent=badge_style, alignment=TA_RIGHT))
            ]
        ]
        
        header_table = Table(header_table_data, colWidths=[380, 160])
        header_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        story.append(header_table)
        story.append(Spacer(1, 10))
        story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#2563eb'), spaceAfter=12))

        # 4-Dimension Scores Summary Table
        t_score = report_data.get("technical", {}).get("score", 0)
        b_score = report_data.get("behavioural", {}).get("score", 0)
        p_score = report_data.get("product_manager", {}).get("score", 0)
        h_score = report_data.get("hiring_manager", {}).get("score", 0)

        score_boxes = [
            [
                Paragraph("<b>Technical</b>", ParagraphStyle('S1', parent=body_style, alignment=TA_CENTER)),
                Paragraph("<b>Behavioural</b>", ParagraphStyle('S2', parent=body_style, alignment=TA_CENTER)),
                Paragraph("<b>Product Manager</b>", ParagraphStyle('S3', parent=body_style, alignment=TA_CENTER)),
                Paragraph("<b>Hiring Manager</b>", ParagraphStyle('S4', parent=body_style, alignment=TA_CENTER)),
                Paragraph("<b>Overall Average</b>", ParagraphStyle('S5', parent=body_style, alignment=TA_CENTER, textColor=colors.HexColor('#1e40af')))
            ],
            [
                Paragraph(f"<b>{t_score:.1f}</b>", badge_style),
                Paragraph(f"<b>{b_score:.1f}</b>", badge_style),
                Paragraph(f"<b>{p_score:.1f}</b>", badge_style),
                Paragraph(f"<b>{h_score:.1f}</b>", badge_style),
                Paragraph(f"<b>{overall_score:.1f}</b>", ParagraphStyle('BadgeHero', parent=badge_style, textColor=colors.HexColor('#1e3a8a'), fontSize=18))
            ]
        ]
        score_table = Table(score_boxes, colWidths=[108, 108, 108, 108, 108])
        score_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f1f5f9')),
            ('BACKGROUND', (0, 1), (-1, 1), colors.HexColor('#f8fafc')),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#cbd5e1')),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        story.append(score_table)
        story.append(Spacer(1, 12))

        # Executive Summary & Recommendation
        story.append(Paragraph("Executive Summary & Recommendation", section_heading))
        summary_text = report_data.get("summary", "Candidate evaluation completed.")
        recommendation_text = report_data.get("recommendation", "Hire")
        story.append(Paragraph(f"<b>Hiring Recommendation:</b> {recommendation_text}", body_style))
        story.append(Spacer(1, 4))
        story.append(Paragraph(summary_text, body_style))
        story.append(Spacer(1, 10))

        # Dimension Evidence Details
        story.append(Paragraph("Evaluation Breakdown & Evidence", section_heading))
        dimensions = [
            ("Technical Proficiency", report_data.get("technical", {})),
            ("Behavioural & Communication", report_data.get("behavioural", {})),
            ("Product Thinking & Empathy", report_data.get("product_manager", {})),
            ("Hiring Manager & Culture Fit", report_data.get("hiring_manager", {})),
        ]

        for dim_title, dim_data in dimensions:
            evidence_list = dim_data.get("evidence", [])
            evidence_str = " ".join(evidence_list) if evidence_list else "Demonstrated competence across core interview inquiries."
            story.append(Paragraph(f"<b>{dim_title} (Score: {dim_data.get('score', 0):.1f}/100)</b>", body_style))
            story.append(Paragraph(f"<i>Evidence:</i> {evidence_str}", ParagraphStyle('EvStyle', parent=body_style, textColor=colors.HexColor('#475569'))))
            story.append(Spacer(1, 6))

        # Strengths & Areas for Improvement
        story.append(Spacer(1, 6))
        story.append(Paragraph("Key Strengths & Growth Areas", section_heading))
        strengths = report_data.get("strengths", [])
        weaknesses = report_data.get("weaknesses", [])
        
        sw_data = [
            [
                Paragraph("<b>Identified Strengths</b>", body_style),
                Paragraph("<b>Areas for Improvement</b>", body_style)
            ],
            [
                Paragraph("<br/>".join([f"• {s}" for s in strengths]), body_style),
                Paragraph("<br/>".join([f"• {w}" for w in weaknesses]), body_style)
            ]
        ]
        sw_table = Table(sw_data, colWidths=[270, 270])
        sw_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f8fafc')),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        story.append(sw_table)

        doc.build(story)
        buffer.seek(0)
        return buffer

pdf_service = PDFService()
