import os
import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

# =============================================================================
# COLOR PALETTE DEFINITIONS (PREMIUM LIGHT THEME WITH VIBRANT ACCENTS)
# =============================================================================
COLOR_BG_LIGHT = RGBColor(0xF6, 0xF3, 0xFC)       # Soft Lavender White
COLOR_BG_WHITE = RGBColor(0xFF, 0xFF, 0xFF)       # Pure White Card Fill
COLOR_DARK_PURPLE = RGBColor(0x2D, 0x12, 0x4D)    # Rich Deep Purple (Primary Text/Headers)
COLOR_ROYAL_VIOLET = RGBColor(0x63, 0x27, 0x9B)   # Royal Violet (Secondary Accents)
COLOR_ACCENT_PURPLE = RGBColor(0x7C, 0x3A, 0xED)  # Vibrant Purple Accent
COLOR_SOFT_PURPLE = RGBColor(0xEE, 0xEA, 0xF9)    # Soft Lavender Fill
COLOR_BORDER_PURPLE = RGBColor(0xC4, 0xB5, 0xFD)  # Subtle Purple Border
COLOR_ACCENT_ORANGE = RGBColor(0xEA, 0x58, 0x0C)  # Bright Orange Accent (Badges & Highlights)
COLOR_ORANGE_LIGHT = RGBColor(0xFF, 0xF7, 0xED)   # Soft Orange Fill
COLOR_TEXT_DARK = RGBColor(0x1E, 0x1B, 0x4B)      # Slate Dark Navy for Body Text
COLOR_TEXT_MUTED = RGBColor(0x47, 0x55, 0x69)     # Slate Gray for Descriptions
COLOR_EMERALD = RGBColor(0x05, 0x96, 0x69)        # Emerald Green Accent
COLOR_CYAN = RGBColor(0x02, 0x84, 0xC7)           # Cyan Blue Accent

def build_presentation():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Helper function to create uniform background
    def set_slide_bg(slide, color=COLOR_BG_LIGHT):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = color
        bg.line.fill.background()
        return bg

    # Helper function for consistent slide header
    def add_slide_header(slide, title_text, category_text="STUDENT STUDY RESOURCE PORTAL"):
        # Category pill
        cat_shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.40), Inches(3.8), Inches(0.32))
        cat_shape.fill.solid()
        cat_shape.fill.fore_color.rgb = COLOR_SOFT_PURPLE
        cat_shape.line.color.rgb = COLOR_BORDER_PURPLE
        cat_shape.line.width = Pt(1)
        tf_cat = cat_shape.text_frame
        tf_cat.word_wrap = True
        tf_cat.vertical_anchor = MSO_ANCHOR.MIDDLE
        tf_cat.margin_left = Inches(0.15)
        p_cat = tf_cat.paragraphs[0]
        p_cat.text = f"●  {category_text}"
        p_cat.font.name = "Segoe UI"
        p_cat.font.size = Pt(9.5)
        p_cat.font.bold = True
        p_cat.font.color.rgb = COLOR_ROYAL_VIOLET
        p_cat.alignment = PP_ALIGN.LEFT

        # Main slide title
        tb = slide.shapes.add_textbox(Inches(0.75), Inches(0.75), Inches(11.8), Inches(0.75))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title_text
        p.font.name = "Segoe UI"
        p.font.size = Pt(24)
        p.font.bold = True
        p.font.color.rgb = COLOR_DARK_PURPLE

        # Accent top-right line
        line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.55), Inches(11.733), Inches(0.025))
        line.fill.solid()
        line.fill.fore_color.rgb = RGBColor(0xDD, 0xD6, 0xFE)
        line.line.fill.background()

    # =========================================================================
    # SLIDE 1: EXACT SPECIFICATION TITLE SLIDE
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)
    set_slide_bg(s1, COLOR_BG_LIGHT)

    # 1. Place PMC TECH logo at top-left corner
    logo_path = "presentation_assets/pmc_tech_logo_transparent.png"
    if not os.path.exists(logo_path):
        logo_path = "presentation_assets/pmc_tech_logo.png"
    if os.path.exists(logo_path):
        s1.shapes.add_picture(logo_path, Inches(0.8), Inches(0.42), width=Inches(1.85))

    # 2. Top-Right: College & Department Information
    header_box = s1.shapes.add_textbox(Inches(2.8), Inches(0.40), Inches(9.733), Inches(1.15))
    tf_h = header_box.text_frame
    tf_h.word_wrap = True
    
    p1 = tf_h.paragraphs[0]
    p1.text = "ER. PERUMAL MANIMEKALAI COLLEGE OF ENGINEERING"
    p1.font.name = "Segoe UI"
    p1.font.size = Pt(17)
    p1.font.bold = True
    p1.font.color.rgb = COLOR_DARK_PURPLE
    p1.alignment = PP_ALIGN.RIGHT

    p2 = tf_h.add_paragraph()
    p2.text = "AN AUTONOMOUS INSTITUTION • HOSUR – 635 117"
    p2.font.name = "Segoe UI"
    p2.font.size = Pt(11)
    p2.font.bold = True
    p2.font.color.rgb = COLOR_TEXT_MUTED
    p2.alignment = PP_ALIGN.RIGHT

    p3 = tf_h.add_paragraph()
    p3.text = "DEPARTMENT OF INFORMATION TECHNOLOGY"
    p3.font.name = "Segoe UI"
    p3.font.size = Pt(13)
    p3.font.bold = True
    p3.font.color.rgb = COLOR_ACCENT_ORANGE
    p3.alignment = PP_ALIGN.RIGHT

    # 3. Thin horizontal line below header
    top_line = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.68), Inches(11.733), Inches(0.035))
    top_line.fill.solid()
    top_line.fill.fore_color.rgb = COLOR_ACCENT_PURPLE
    top_line.line.fill.background()

    # 4. Large rectangular title box with border and label "PROJECT TITLE"
    title_box = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(2.0), Inches(11.733), Inches(1.72))
    title_box.fill.solid()
    title_box.fill.fore_color.rgb = COLOR_BG_WHITE
    title_box.line.color.rgb = COLOR_ROYAL_VIOLET
    title_box.line.width = Pt(2.5)

    # Orange label "PROJECT TITLE"
    label_box = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.1), Inches(1.85), Inches(2.1), Inches(0.36))
    label_box.fill.solid()
    label_box.fill.fore_color.rgb = COLOR_ACCENT_ORANGE
    label_box.line.fill.background()
    tf_lbl = label_box.text_frame
    tf_lbl.vertical_anchor = MSO_ANCHOR.MIDDLE
    p_lbl = tf_lbl.paragraphs[0]
    p_lbl.text = "PROJECT TITLE"
    p_lbl.font.name = "Segoe UI"
    p_lbl.font.size = Pt(11)
    p_lbl.font.bold = True
    p_lbl.font.color.rgb = COLOR_BG_WHITE
    p_lbl.alignment = PP_ALIGN.CENTER

    # 5. Inside it, write Student Study Resource Portal in large, bold text
    tf_title = title_box.text_frame
    tf_title.word_wrap = True
    tf_title.vertical_anchor = MSO_ANCHOR.MIDDLE
    p_title = tf_title.paragraphs[0]
    p_title.text = "Student Study Resource Portal"
    p_title.font.name = "Segoe UI"
    p_title.font.size = Pt(34)
    p_title.font.bold = True
    p_title.font.color.rgb = COLOR_DARK_PURPLE
    p_title.alignment = PP_ALIGN.CENTER

    p_sub = tf_title.add_paragraph()
    p_sub.text = "A Modern Academic Learning Hub & Study Material Sharing Platform"
    p_sub.font.name = "Segoe UI"
    p_sub.font.size = Pt(13.5)
    p_sub.font.color.rgb = COLOR_ROYAL_VIOLET
    p_sub.alignment = PP_ALIGN.CENTER

    # 6. Bottom-Left: "PRESENTED BY" Large Rounded Rectangle
    pres_card = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(4.08), Inches(7.0), Inches(2.95))
    pres_card.fill.solid()
    pres_card.fill.fore_color.rgb = COLOR_BG_WHITE
    pres_card.line.color.rgb = COLOR_ACCENT_PURPLE
    pres_card.line.width = Pt(2)

    pres_lbl = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.1), Inches(3.92), Inches(2.2), Inches(0.36))
    pres_lbl.fill.solid()
    pres_lbl.fill.fore_color.rgb = COLOR_ACCENT_ORANGE
    pres_lbl.line.fill.background()
    tf_plbl = pres_lbl.text_frame
    tf_plbl.vertical_anchor = MSO_ANCHOR.MIDDLE
    p_plbl = tf_plbl.paragraphs[0]
    p_plbl.text = "PRESENTED BY"
    p_plbl.font.name = "Segoe UI"
    p_plbl.font.size = Pt(11)
    p_plbl.font.bold = True
    p_plbl.font.color.rgb = COLOR_BG_WHITE
    p_plbl.alignment = PP_ALIGN.CENTER

    # 7. Five individual name boxes arranged in two rows
    # Row 1: S. Keerthana, G. Kirthimaha, K. Keerthana
    # Row 2: R. Madhu Shri, S. Madhumita
    names_row1 = ["S. Keerthana", "G. Kirthimaha", "K. Keerthana"]
    names_row2 = ["R. Madhu Shri", "S. Madhumita"]
    box_w = Inches(2.05)
    box_h = Inches(0.9)
    gap_x = Inches(0.18)

    for i, name in enumerate(names_row1):
        bx = Inches(1.05) + i * (box_w + gap_x)
        by = Inches(4.48)
        nb = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, bx, by, box_w, box_h)
        nb.fill.solid()
        nb.fill.fore_color.rgb = COLOR_SOFT_PURPLE
        nb.line.color.rgb = COLOR_BORDER_PURPLE
        nb.line.width = Pt(1.5)
        tf_n = nb.text_frame
        tf_n.vertical_anchor = MSO_ANCHOR.MIDDLE
        p_n = tf_n.paragraphs[0]
        p_n.text = name
        p_n.font.name = "Segoe UI"
        p_n.font.size = Pt(13)
        p_n.font.bold = True
        p_n.font.color.rgb = COLOR_DARK_PURPLE
        p_n.alignment = PP_ALIGN.CENTER
        p_role = tf_n.add_paragraph()
        p_role.text = "B.Tech IT"
        p_role.font.name = "Segoe UI"
        p_role.font.size = Pt(9.5)
        p_role.font.color.rgb = COLOR_TEXT_MUTED
        p_role.alignment = PP_ALIGN.CENTER

    r2_offset = Inches(1.05) + (Inches(6.5) - (2 * box_w + gap_x)) / 2
    for i, name in enumerate(names_row2):
        bx = r2_offset + i * (box_w + gap_x)
        by = Inches(5.63)
        nb = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, bx, by, box_w, box_h)
        nb.fill.solid()
        nb.fill.fore_color.rgb = COLOR_SOFT_PURPLE
        nb.line.color.rgb = COLOR_BORDER_PURPLE
        nb.line.width = Pt(1.5)
        tf_n = nb.text_frame
        tf_n.vertical_anchor = MSO_ANCHOR.MIDDLE
        p_n = tf_n.paragraphs[0]
        p_n.text = name
        p_n.font.name = "Segoe UI"
        p_n.font.size = Pt(13)
        p_n.font.bold = True
        p_n.font.color.rgb = COLOR_DARK_PURPLE
        p_n.alignment = PP_ALIGN.CENTER
        p_role = tf_n.add_paragraph()
        p_role.text = "B.Tech IT"
        p_role.font.name = "Segoe UI"
        p_role.font.size = Pt(9.5)
        p_role.font.color.rgb = COLOR_TEXT_MUTED
        p_role.alignment = PP_ALIGN.CENTER

    # 8. Bottom-Right: STAFF GUIDE Section
    staff_card = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(8.15), Inches(4.08), Inches(4.383), Inches(1.35))
    staff_card.fill.solid()
    staff_card.fill.fore_color.rgb = COLOR_BG_WHITE
    staff_card.line.color.rgb = COLOR_ACCENT_ORANGE
    staff_card.line.width = Pt(2)

    staff_lbl = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(8.35), Inches(3.92), Inches(1.8), Inches(0.36))
    staff_lbl.fill.solid()
    staff_lbl.fill.fore_color.rgb = COLOR_ACCENT_ORANGE
    staff_lbl.line.fill.background()
    tf_slbl = staff_lbl.text_frame
    tf_slbl.vertical_anchor = MSO_ANCHOR.MIDDLE
    p_slbl = tf_slbl.paragraphs[0]
    p_slbl.text = "STAFF GUIDE"
    p_slbl.font.name = "Segoe UI"
    p_slbl.font.size = Pt(11)
    p_slbl.font.bold = True
    p_slbl.font.color.rgb = COLOR_BG_WHITE
    p_slbl.alignment = PP_ALIGN.CENTER

    tf_st = staff_card.text_frame
    tf_st.word_wrap = True
    tf_st.vertical_anchor = MSO_ANCHOR.MIDDLE
    tf_st.margin_left = Inches(0.25)
    p_st1 = tf_st.paragraphs[0]
    p_st1.text = "Dr. Sathish"
    p_st1.font.name = "Segoe UI"
    p_st1.font.size = Pt(16)
    p_st1.font.bold = True
    p_st1.font.color.rgb = COLOR_DARK_PURPLE
    p_st1.alignment = PP_ALIGN.LEFT

    p_st2 = tf_st.add_paragraph()
    p_st2.text = "Designation: HOD"
    p_st2.font.name = "Segoe UI"
    p_st2.font.size = Pt(12)
    p_st2.font.bold = True
    p_st2.font.color.rgb = COLOR_ACCENT_ORANGE
    p_st2.alignment = PP_ALIGN.LEFT

    p_st3 = tf_st.add_paragraph()
    p_st3.text = "Department of Information Technology"
    p_st3.font.name = "Segoe UI"
    p_st3.font.size = Pt(10.5)
    p_st3.font.color.rgb = COLOR_TEXT_MUTED
    p_st3.alignment = PP_ALIGN.LEFT

    # 9. Bottom-Right: STUDENT GUIDE Section
    stud_card = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(8.15), Inches(5.68), Inches(4.383), Inches(1.35))
    stud_card.fill.solid()
    stud_card.fill.fore_color.rgb = COLOR_BG_WHITE
    stud_card.line.color.rgb = COLOR_ROYAL_VIOLET
    stud_card.line.width = Pt(2)

    stud_lbl = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(8.35), Inches(5.52), Inches(1.9), Inches(0.36))
    stud_lbl.fill.solid()
    stud_lbl.fill.fore_color.rgb = COLOR_ROYAL_VIOLET
    stud_lbl.line.fill.background()
    tf_stlbl = stud_lbl.text_frame
    tf_stlbl.vertical_anchor = MSO_ANCHOR.MIDDLE
    p_stlbl = tf_stlbl.paragraphs[0]
    p_stlbl.text = "STUDENT GUIDE"
    p_stlbl.font.name = "Segoe UI"
    p_stlbl.font.size = Pt(11)
    p_stlbl.font.bold = True
    p_stlbl.font.color.rgb = COLOR_BG_WHITE
    p_stlbl.alignment = PP_ALIGN.CENTER

    tf_sg = stud_card.text_frame
    tf_sg.word_wrap = True
    tf_sg.vertical_anchor = MSO_ANCHOR.MIDDLE
    tf_sg.margin_left = Inches(0.25)
    p_sg1 = tf_sg.paragraphs[0]
    p_sg1.text = "M. Sowbhagya Lakshmi"
    p_sg1.font.name = "Segoe UI"
    p_sg1.font.size = Pt(16)
    p_sg1.font.bold = True
    p_sg1.font.color.rgb = COLOR_DARK_PURPLE
    p_sg1.alignment = PP_ALIGN.LEFT

    p_sg2 = tf_sg.add_paragraph()
    p_sg2.text = "Designation: Student"
    p_sg2.font.name = "Segoe UI"
    p_sg2.font.size = Pt(12)
    p_sg2.font.bold = True
    p_sg2.font.color.rgb = COLOR_ROYAL_VIOLET
    p_sg2.alignment = PP_ALIGN.LEFT

    p_sg3 = tf_sg.add_paragraph()
    p_sg3.text = "Department of Information Technology"
    p_sg3.font.name = "Segoe UI"
    p_sg3.font.size = Pt(10.5)
    p_sg3.font.color.rgb = COLOR_TEXT_MUTED
    p_sg3.alignment = PP_ALIGN.LEFT


    # =========================================================================
    # SLIDE 2: INTRODUCTION & PROBLEM STATEMENT
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    set_slide_bg(s2)
    add_slide_header(s2, "Introduction & Problem Statement", "PROJECT BACKGROUND & CHALLENGES")

    grid_w = Inches(5.7)
    grid_h = Inches(2.25)

    problems = [
        ("01", "Fragmented & Lost Study Materials", 
         "Critical syllabus notes, lab codes, and manuals are scattered across chaotic WhatsApp groups, personal Google Drives, and loose paper sheets, leading to lost files during exam preparation.",
         "⚠️  Bottleneck: 45+ minutes lost hunting across chats per revision", COLOR_ROYAL_VIOLET),
        ("02", "Inconsistent & Unverified Quality", 
         "Informally circulated notes frequently suffer from incomplete derivations, missing diagrams, and broken code snippets without faculty or peer verification mechanisms.",
         "❌  Academic Risk: Misleading syntax and exam score deductions", COLOR_ACCENT_ORANGE),
        ("03", "Missing Question Papers & Syllabi", 
         "Students struggle to access authentic previous year autonomous question papers (PYQs) and regulation syllabus documents in a single structured repository.",
         "📑  Gap: No centralized year-wise question bank archive", COLOR_ACCENT_PURPLE),
        ("04", "Poor Mobile & Search Experience", 
         "Large scanned PDFs are cumbersome to read on smartphones and lack instant keyword search, pre-formatted code copying, or clean offline print-to-PDF export.",
         "📱  Barrier: Hard to study on mobile or during transit", COLOR_DARK_PURPLE)
    ]

    for idx, (num, title, text, pill_text, col) in enumerate(problems):
        row = idx // 2
        col_idx = idx % 2
        gx = Inches(0.8) + col_idx * (grid_w + Inches(0.33))
        gy = Inches(1.80) + row * (grid_h + Inches(0.20))

        p_card = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, gx, gy, grid_w, grid_h)
        p_card.fill.solid()
        p_card.fill.fore_color.rgb = COLOR_BG_WHITE
        p_card.line.color.rgb = COLOR_BORDER_PURPLE
        p_card.line.width = Pt(1.5)

        # Number badge
        nb = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, gx + Inches(0.20), gy + Inches(0.20), Inches(0.60), Inches(0.60))
        nb.fill.solid()
        nb.fill.fore_color.rgb = col
        nb.line.fill.background()
        tf_nb = nb.text_frame
        tf_nb.vertical_anchor = MSO_ANCHOR.MIDDLE
        p_num = tf_nb.paragraphs[0]
        p_num.text = num
        p_num.font.name = "Segoe UI"
        p_num.font.size = Pt(14)
        p_num.font.bold = True
        p_num.font.color.rgb = COLOR_BG_WHITE
        p_num.alignment = PP_ALIGN.CENTER

        tbox = s2.shapes.add_textbox(gx + Inches(0.95), gy + Inches(0.12), grid_w - Inches(1.15), Inches(1.35))
        tf = tbox.text_frame
        tf.word_wrap = True
        p1 = tf.paragraphs[0]
        p1.text = title
        p1.font.name = "Segoe UI"
        p1.font.size = Pt(13)
        p1.font.bold = True
        p1.font.color.rgb = COLOR_DARK_PURPLE

        p2 = tf.add_paragraph()
        p2.text = text
        p2.font.name = "Segoe UI"
        p2.font.size = Pt(9.8)
        p2.font.color.rgb = COLOR_TEXT_MUTED

        # Bottom Impact Pill
        pill = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, gx + Inches(0.20), gy + grid_h - Inches(0.50), grid_w - Inches(0.40), Inches(0.36))
        pill.fill.solid()
        pill.fill.fore_color.rgb = COLOR_SOFT_PURPLE
        pill.line.color.rgb = COLOR_BORDER_PURPLE
        pill.line.width = Pt(1)
        tf_p = pill.text_frame
        tf_p.vertical_anchor = MSO_ANCHOR.MIDDLE
        tf_p.margin_left = Inches(0.12)
        p_pl = tf_p.paragraphs[0]
        p_pl.text = pill_text
        p_pl.font.name = "Segoe UI"
        p_pl.font.size = Pt(9.2)
        p_pl.font.bold = True
        p_pl.font.color.rgb = col

    # Bottom Impact Highlight Banner
    imp_banner = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(6.55), Inches(11.733), Inches(0.55))
    imp_banner.fill.solid()
    imp_banner.fill.fore_color.rgb = COLOR_ORANGE_LIGHT
    imp_banner.line.color.rgb = COLOR_ACCENT_ORANGE
    imp_banner.line.width = Pt(1.5)
    tf_ib = imp_banner.text_frame
    tf_ib.vertical_anchor = MSO_ANCHOR.MIDDLE
    tf_ib.margin_left = Inches(0.20)
    p_ib = tf_ib.paragraphs[0]
    p_ib.text = "💡 Proposed Solution: Student Study Resource Portal delivers a verified, single-source learning platform with instant search, curated code, and previous exam question papers."
    p_ib.font.name = "Segoe UI"
    p_ib.font.size = Pt(10)
    p_ib.font.bold = True
    p_ib.font.color.rgb = COLOR_ACCENT_ORANGE


    # =========================================================================
    # SLIDE 3: OBJECTIVES & ACADEMIC SCOPE
    # =========================================================================
    s3 = prs.slides.add_slide(blank_layout)
    set_slide_bg(s3)
    add_slide_header(s3, "Project Objectives & Academic Scope", "PROJECT GOALS & SCOPE")

    obj_w = Inches(5.7)
    obj_h = Inches(2.25)

    objectives = [
        ("🎯", "Centralize Academic Resources", 
         "Establish a unified, high-availability web portal hosting verified semester notes, reference guides, lab manuals, and syllabus files across engineering departments.",
         "Deliver a single verified source of truth for all IT & Engineering students", COLOR_ROYAL_VIOLET),
        ("⚡", "Sub-Second Search & Subject Filtering", 
         "Implement real-time client-side keyword matching, department filtering (IT, CSE, ECE, Mech, Civil), and interactive concept chips for instant study material discovery.",
         "Zero reload delay; sub-millisecond query response on desktop and mobile", COLOR_ACCENT_ORANGE),
        ("📤", "Verified Peer-Contribution Pipeline", 
         "Empower students to upload study notes, lab solutions, and previous year question papers with multipart file validation and administrative moderation before publishing.",
         "Secure Multer disk engine supporting academic files up to 25 MB", COLOR_ACCENT_PURPLE),
        ("💻", "Interactive Study Aids & Clean Export", 
         "Provide in-browser syntax-styled code snippets with 1-click clipboard copy, client-side .txt note generation via HTML5 Blob, and clean browser print-to-PDF formatting.",
         "Frictionless offline exam hall revisions without third-party apps", COLOR_EMERALD)
    ]

    for idx, (icon, title, desc, kpi, clr) in enumerate(objectives):
        row = idx // 2
        col_idx = idx % 2
        ox = Inches(0.8) + col_idx * (obj_w + Inches(0.33))
        oy = Inches(1.80) + row * (obj_h + Inches(0.20))

        card = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, ox, oy, obj_w, obj_h)
        card.fill.solid()
        card.fill.fore_color.rgb = COLOR_BG_WHITE
        card.line.color.rgb = COLOR_BORDER_PURPLE
        card.line.width = Pt(1.5)

        # Left color bar
        bar = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, ox, oy, Inches(0.18), obj_h)
        bar.fill.solid()
        bar.fill.fore_color.rgb = clr
        bar.line.fill.background()

        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_left = Inches(0.32)
        tf.margin_right = Inches(0.20)
        tf.margin_top = Inches(0.16)

        p1 = tf.paragraphs[0]
        p1.text = f"{icon}  {title}"
        p1.font.name = "Segoe UI"
        p1.font.size = Pt(13.5)
        p1.font.bold = True
        p1.font.color.rgb = COLOR_DARK_PURPLE

        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.name = "Segoe UI"
        p2.font.size = Pt(10)
        p2.font.color.rgb = COLOR_TEXT_MUTED

        # KPI Pill
        kpill = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, ox + Inches(0.32), oy + obj_h - Inches(0.50), obj_w - Inches(0.52), Inches(0.36))
        kpill.fill.solid()
        kpill.fill.fore_color.rgb = COLOR_SOFT_PURPLE
        kpill.line.color.rgb = COLOR_BORDER_PURPLE
        kpill.line.width = Pt(1)
        tf_kp = kpill.text_frame
        tf_kp.vertical_anchor = MSO_ANCHOR.MIDDLE
        tf_kp.margin_left = Inches(0.12)
        p_kp = tf_kp.paragraphs[0]
        p_kp.text = f"★  Target: {kpi}"
        p_kp.font.name = "Segoe UI"
        p_kp.font.size = Pt(9.0)
        p_kp.font.bold = True
        p_kp.font.color.rgb = clr

    # Bottom Scope Banner
    scope_banner = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(6.55), Inches(11.733), Inches(0.55))
    scope_banner.fill.solid()
    scope_banner.fill.fore_color.rgb = COLOR_SOFT_PURPLE
    scope_banner.line.color.rgb = COLOR_BORDER_PURPLE
    scope_banner.line.width = Pt(1.5)
    tf_sb = scope_banner.text_frame
    tf_sb.vertical_anchor = MSO_ANCHOR.MIDDLE
    tf_sb.margin_left = Inches(0.20)
    p_sb = tf_sb.paragraphs[0]
    p_sb.text = "🏛️ Academic Scope: Designed specifically for Er. Perumal Manimekalai College of Engineering (Autonomous), supporting Anna University syllabus regulations and departmental curricula."
    p_sb.font.name = "Segoe UI"
    p_sb.font.size = Pt(10)
    p_sb.font.bold = True
    p_sb.font.color.rgb = COLOR_ROYAL_VIOLET


    # =========================================================================
    # SLIDE 4: SYSTEM ARCHITECTURE & TECHNOLOGY STACK
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    set_slide_bg(s4)
    add_slide_header(s4, "System Architecture & Technology Stack", "SYSTEM DESIGN & STACK")

    tech_cols = [
        ("Tier 1: Presentation Layer", COLOR_ROYAL_VIOLET, [
            ("HTML5 Semantic Markup", "Structured views, responsive grid cards, and accessible modals"),
            ("Vanilla CSS3 & Tokens", "Glassmorphic effects, modern color variables, and @media print rules"),
            ("Vanilla JavaScript ES6+", "Lightweight Single-Page App controller, state management, & search"),
            ("Modern Typography & Icons", "Outfit, Segoe UI, JetBrains Mono code styles, and Font Awesome")
        ]),
        ("Tier 2: Application / API Layer", COLOR_ACCENT_ORANGE, [
            ("Node.js Runtime", "High-performance, event-driven asynchronous JavaScript server"),
            ("Express.js Framework", "RESTful API routing (/api/login, /api/upload, /api/resources)"),
            ("bcryptjs & Sessions", "Salted password hashing and encrypted cookie session management"),
            ("Multer Disk Engine", "Multi-part form-data processor with strict 25 MB disk limits")
        ]),
        ("Tier 3: Data & Storage Layer", COLOR_ACCENT_PURPLE, [
            ("SQLite (better-sqlite3)", "Embedded zero-configuration database (studyportal.db)"),
            ("Parameterized SQL Queries", "Pre-compiled safe queries guaranteeing SQL injection defense"),
            ("Document & PDF Storage", "Sanitized file directory storage for lecture notes and PYQs"),
            ("Nodemailer Email Service", "Automated email alerts for registrations and contribution reviews")
        ])
    ]

    col_w = Inches(3.75)
    for c_idx, (cat_name, cat_clr, items) in enumerate(tech_cols):
        cx = Inches(0.8) + c_idx * (col_w + Inches(0.24))
        cy = Inches(1.80)
        
        container = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, cx, cy, col_w, Inches(5.30))
        container.fill.solid()
        container.fill.fore_color.rgb = COLOR_BG_WHITE
        container.line.color.rgb = COLOR_BORDER_PURPLE
        container.line.width = Pt(1.5)

        # Header banner
        hdr = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, cx + Inches(0.15), cy + Inches(0.15), col_w - Inches(0.3), Inches(0.55))
        hdr.fill.solid()
        hdr.fill.fore_color.rgb = cat_clr
        hdr.line.fill.background()
        tf_h = hdr.text_frame
        tf_h.vertical_anchor = MSO_ANCHOR.MIDDLE
        p_h = tf_h.paragraphs[0]
        p_h.text = cat_name
        p_h.font.name = "Segoe UI"
        p_h.font.size = Pt(13)
        p_h.font.bold = True
        p_h.font.color.rgb = COLOR_BG_WHITE
        p_h.alignment = PP_ALIGN.CENTER

        for i_idx, (tech_title, tech_desc) in enumerate(items):
            iy = cy + Inches(0.85) + i_idx * Inches(1.05)
            item_box = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, cx + Inches(0.15), iy, col_w - Inches(0.3), Inches(0.95))
            item_box.fill.solid()
            item_box.fill.fore_color.rgb = COLOR_SOFT_PURPLE
            item_box.line.color.rgb = COLOR_BORDER_PURPLE
            item_box.line.width = Pt(1)
            
            tf_i = item_box.text_frame
            tf_i.word_wrap = True
            tf_i.margin_left = Inches(0.15)
            tf_i.margin_right = Inches(0.15)
            tf_i.margin_top = Inches(0.10)
            p_t = tf_i.paragraphs[0]
            p_t.text = f"●  {tech_title}"
            p_t.font.name = "Segoe UI"
            p_t.font.size = Pt(10.5)
            p_t.font.bold = True
            p_t.font.color.rgb = COLOR_DARK_PURPLE

            p_d = tf_i.add_paragraph()
            p_d.text = tech_desc
            p_d.font.name = "Segoe UI"
            p_d.font.size = Pt(8.8)
            p_d.font.color.rgb = COLOR_TEXT_MUTED


    # =========================================================================
    # SLIDE 5: CORE FUNCTIONAL MODULES
    # =========================================================================
    s5 = prs.slides.add_slide(blank_layout)
    set_slide_bg(s5)
    add_slide_header(s5, "Core Functional Modules", "PORTAL FEATURES & MODULES")

    mod_w = Inches(3.75)
    mod_h = Inches(2.50)

    modules = [
        ("🏠", "Home & Student Dashboard", 
         "Academic overview with department counters, feature highlight pills, quick navigation shortcuts, and real-time announcements.",
         ["• Academic year 2026 header banner", "• Live verified resources counter", "• 1-click shortcut navigation pills"], COLOR_ROYAL_VIOLET),
        ("📚", "Curated Syllabus Notes Library", 
         "Subject-organized repository with reading-time badges, unit summaries, and exam-oriented cheat-sheets for rapid revision.",
         ["• Coverage: C, Web, Cloud, Java, Python", "• Department & semester filter chips", "• Clean in-modal reading interface"], COLOR_ACCENT_ORANGE),
        ("📑", "Question Papers (PYQ) Archive", 
         "Dedicated autonomous and Anna University previous question papers organized by semester, subject code, and regulation.",
         ["• Semester-wise exam paper bank", "• Direct download & preview links", "• Model answers and question patterns"], COLOR_ACCENT_PURPLE),
        ("📤", "Peer Contribution Pipeline", 
         "Authenticated portal allowing students to upload study notes, lab solutions, and question papers with subject tags.",
         ["• Multer engine supporting up to 25 MB", "• Metadata tagging (Branch, Sem, Unit)", "• Automated MIME type sanitization"], COLOR_DARK_PURPLE),
        ("🛠️", "Admin & Guide Moderation Panel", 
         "Role-based console allowing Staff Guide (Dr. Sathish) and Student Guide to review, approve, or reject student uploads.",
         ["• Pending submission approval queue", "• Quality check before public visibility", "• Dynamic live catalog indexing"], COLOR_ACCENT_ORANGE),
        ("⚡", "Interactive Code & Export Tools", 
         "Hands-on study tools enabling instant code copying, client-side .txt note generation via Blob, and print-to-PDF export.",
         ["• Syntax-styled code box with 1-click copy", "• Browser print-to-PDF formatting", "• Zero external reader requirements"], COLOR_ROYAL_VIOLET)
    ]

    for idx, (icon, title, desc, sub_bullets, clr) in enumerate(modules):
        row = idx // 3
        col_idx = idx % 3
        mx = Inches(0.8) + col_idx * (mod_w + Inches(0.24))
        my = Inches(1.80) + row * (mod_h + Inches(0.20))

        card = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, mx, my, mod_w, mod_h)
        card.fill.solid()
        card.fill.fore_color.rgb = COLOR_BG_WHITE
        card.line.color.rgb = COLOR_BORDER_PURPLE
        card.line.width = Pt(1.5)

        # Header bar inside card
        hbar = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, mx + Inches(0.12), my + Inches(0.12), mod_w - Inches(0.24), Inches(0.42))
        hbar.fill.solid()
        hbar.fill.fore_color.rgb = clr
        hbar.line.fill.background()
        tf_hb = hbar.text_frame
        tf_hb.vertical_anchor = MSO_ANCHOR.MIDDLE
        p_hb = tf_hb.paragraphs[0]
        p_hb.text = f"{icon}  {title}"
        p_hb.font.name = "Segoe UI"
        p_hb.font.size = Pt(11.5)
        p_hb.font.bold = True
        p_hb.font.color.rgb = COLOR_BG_WHITE

        tb = s5.shapes.add_textbox(mx + Inches(0.12), my + Inches(0.58), mod_w - Inches(0.24), Inches(0.85))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = desc
        p.font.name = "Segoe UI"
        p.font.size = Pt(9.5)
        p.font.color.rgb = COLOR_TEXT_MUTED

        bb = s5.shapes.add_textbox(mx + Inches(0.12), my + Inches(1.48), mod_w - Inches(0.24), Inches(0.90))
        tf_bb = bb.text_frame
        tf_bb.word_wrap = True
        for b_text in sub_bullets:
            p_b = tf_bb.add_paragraph() if tf_bb.paragraphs[0].text else tf_bb.paragraphs[0]
            p_b.text = b_text
            p_b.font.name = "Segoe UI"
            p_b.font.size = Pt(8.8)
            p_b.font.color.rgb = clr


    # =========================================================================
    # SLIDE 6: OPERATIONAL WORKFLOW & IMPLEMENTATION HIGHLIGHTS
    # =========================================================================
    s6 = prs.slides.add_slide(blank_layout)
    set_slide_bg(s6)
    add_slide_header(s6, "System Workflow & Implementation Highlights", "OPERATIONAL PIPELINE")

    step_w = Inches(2.7)
    step_h = Inches(3.70)

    steps = [
        ("Step 1", "🔐 Authentication & Access", 
         "Student enters credentials on Register/Login page. Backend hashes password via bcryptjs, validates uniqueness in SQLite, and establishes encrypted session cookie.",
         "POST /api/login", COLOR_ROYAL_VIOLET,
         ["• Email validation check", "• Salted bcryptjs hashing", "• Encrypted session cookie"]),
        ("Step 2", "🔍 Search & Discovery", 
         "Student selects department & semester. Real-time client listeners match keywords across titles, syllabi, and units with sub-millisecond response.",
         "Sub-Second Client Matching", COLOR_ACCENT_ORANGE,
         ["• Real-time input listener", "• Subject chip toggle", "• Instant multi-field match"]),
        ("Step 3", "📖 Study & Code Export", 
         "Modal reader presents structured syllabus notes and runnable code. Student uses 1-click copy to export code directly into their IDE or prints clean PDF.",
         "1-Click Clipboard & Print", COLOR_ACCENT_PURPLE,
         ["• Syntax-styled code box", "• 1-click clipboard copy", "• Clean @media print PDF"]),
        ("Step 4", "📤 Contribution & Review", 
         "Authenticated student uploads note or PYQ via Multer. Staff & Student Guides review submission in moderation console before publishing to live catalog.",
         "Multer & Admin Approval", COLOR_DARK_PURPLE,
         ["• 25 MB Multer disk storage", "• Guide review console", "• Instant catalog publish"])
    ]

    for idx, (step_num, title, text, badge, col, b_list) in enumerate(steps):
        sx = Inches(0.8) + idx * (step_w + Inches(0.27))
        sy = Inches(1.80)

        card = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, sx, sy, step_w, step_h)
        card.fill.solid()
        card.fill.fore_color.rgb = COLOR_BG_WHITE
        card.line.color.rgb = COLOR_BORDER_PURPLE
        card.line.width = Pt(1.5)

        # Step Pill
        spill = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, sx + Inches(0.15), sy + Inches(0.15), Inches(1.1), Inches(0.35))
        spill.fill.solid()
        spill.fill.fore_color.rgb = col
        spill.line.fill.background()
        tf_sp = spill.text_frame
        tf_sp.vertical_anchor = MSO_ANCHOR.MIDDLE
        p_sp = tf_sp.paragraphs[0]
        p_sp.text = step_num
        p_sp.font.name = "Segoe UI"
        p_sp.font.size = Pt(11)
        p_sp.font.bold = True
        p_sp.font.color.rgb = COLOR_BG_WHITE
        p_sp.alignment = PP_ALIGN.CENTER

        # Title
        tb = s6.shapes.add_textbox(sx + Inches(0.15), sy + Inches(0.55), step_w - Inches(0.3), Inches(0.70))
        tf = tb.text_frame
        tf.word_wrap = True
        p_t = tf.paragraphs[0]
        p_t.text = title
        p_t.font.name = "Segoe UI"
        p_t.font.size = Pt(11.5)
        p_t.font.bold = True
        p_t.font.color.rgb = COLOR_DARK_PURPLE

        # Body text
        tb2 = s6.shapes.add_textbox(sx + Inches(0.15), sy + Inches(1.25), step_w - Inches(0.3), Inches(1.10))
        tf2 = tb2.text_frame
        tf2.word_wrap = True
        p_b = tf2.paragraphs[0]
        p_b.text = text
        p_b.font.name = "Segoe UI"
        p_b.font.size = Pt(9.2)
        p_b.font.color.rgb = COLOR_TEXT_MUTED

        # Bullet highlights
        tb3 = s6.shapes.add_textbox(sx + Inches(0.15), sy + Inches(2.35), step_w - Inches(0.3), Inches(0.75))
        tf3 = tb3.text_frame
        tf3.word_wrap = True
        for b in b_list:
            p_bl = tf3.add_paragraph() if tf3.paragraphs[0].text else tf3.paragraphs[0]
            p_bl.text = b
            p_bl.font.name = "Segoe UI"
            p_bl.font.size = Pt(8.5)
            p_bl.font.color.rgb = col

        # Bottom badge
        bb = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, sx + Inches(0.15), sy + step_h - Inches(0.50), step_w - Inches(0.3), Inches(0.36))
        bb.fill.solid()
        bb.fill.fore_color.rgb = COLOR_SOFT_PURPLE
        bb.line.color.rgb = COLOR_BORDER_PURPLE
        bb.line.width = Pt(1)
        tf_bb = bb.text_frame
        tf_bb.vertical_anchor = MSO_ANCHOR.MIDDLE
        p_bb = tf_bb.paragraphs[0]
        p_bb.text = f"⚙️  {badge}"
        p_bb.font.name = "Segoe UI"
        p_bb.font.size = Pt(8.8)
        p_bb.font.bold = True
        p_bb.font.color.rgb = col
        p_bb.alignment = PP_ALIGN.CENTER

    # Bottom Implementation Highlight Card
    hl_card = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(5.70), Inches(11.733), Inches(1.40))
    hl_card.fill.solid()
    hl_card.fill.fore_color.rgb = COLOR_BG_WHITE
    hl_card.line.color.rgb = COLOR_ACCENT_ORANGE
    hl_card.line.width = Pt(1.5)

    tf_hl = hl_card.text_frame
    tf_hl.word_wrap = True
    tf_hl.margin_left = Inches(0.25)
    tf_hl.margin_top = Inches(0.15)
    p_h1 = tf_hl.paragraphs[0]
    p_h1.text = "💻 Full-Stack Production Implementation Details"
    p_h1.font.name = "Segoe UI"
    p_h1.font.size = Pt(12.5)
    p_h1.font.bold = True
    p_h1.font.color.rgb = COLOR_ACCENT_ORANGE

    p_h2 = tf_hl.add_paragraph()
    p_h2.text = "• Modular Architecture: Structured Node.js + Express backend running database.js (SQLite persistence), server.js (REST APIs & Multer upload limits), questionPapersData.js (curated autonomous PYQ catalog), and mailer.js (registration alerts)."
    p_h2.font.name = "Segoe UI"
    p_h2.font.size = Pt(9.8)
    p_h2.font.color.rgb = COLOR_TEXT_DARK

    p_h3 = tf_hl.add_paragraph()
    p_h3.text = "• Zero-Dependency Frontend: High-performance Vanilla JS Single-Page Application (SPA) with responsive CSS glassmorphism, instant client search, and clean @media print export."
    p_h3.font.name = "Segoe UI"
    p_h3.font.size = Pt(9.8)
    p_h3.font.color.rgb = COLOR_ROYAL_VIOLET


    # =========================================================================
    # SLIDE 7: RESULTS, ACADEMIC IMPACT & FUTURE SCOPE
    # =========================================================================
    s7 = prs.slides.add_slide(blank_layout)
    set_slide_bg(s7)
    add_slide_header(s7, "Results, Academic Impact & Future Scope", "OUTCOMES & ROADMAP")

    half_w = Inches(5.7)

    # Left Container: Key Benefits & Academic Impact
    left_box = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.80), half_w, Inches(4.55))
    left_box.fill.solid()
    left_box.fill.fore_color.rgb = COLOR_BG_WHITE
    left_box.line.color.rgb = COLOR_ACCENT_PURPLE
    left_box.line.width = Pt(1.5)

    l_hdr = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.95), Inches(1.95), half_w - Inches(0.3), Inches(0.48))
    l_hdr.fill.solid()
    l_hdr.fill.fore_color.rgb = COLOR_ROYAL_VIOLET
    l_hdr.line.fill.background()
    tf_lh = l_hdr.text_frame
    tf_lh.vertical_anchor = MSO_ANCHOR.MIDDLE
    p_lh = tf_lh.paragraphs[0]
    p_lh.text = "🎓 Key Advantages & Academic Impact"
    p_lh.font.name = "Segoe UI"
    p_lh.font.size = Pt(12)
    p_lh.font.bold = True
    p_lh.font.color.rgb = COLOR_BG_WHITE
    p_lh.alignment = PP_ALIGN.CENTER

    impact_items = [
        ("⚡ 80% Time Reduction in Resource Hunting", "Eliminates frustrating searches across unorganized WhatsApp chats, providing verified syllabus notes and PYQs in sub-seconds."),
        ("🎯 100% Verified Academic Syllabus Accuracy", "Faculty and guide moderation prevents the spread of inaccurate code, broken logic, and incomplete derivations."),
        ("🤝 Peer-Powered Collaboration Culture", "Student contributors are credited for their quality uploads, encouraging a continuous culture of academic knowledge sharing."),
        ("📱 Frictionless Multi-Device Access", "Seamless mobile and desktop responsiveness enables quick revision during transit, lab sessions, and right before exam hall entry.")
    ]

    for idx, (head, text) in enumerate(impact_items):
        iy = Inches(2.55) + idx * Inches(0.92)
        ibox = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.95), iy, half_w - Inches(0.3), Inches(0.82))
        ibox.fill.solid()
        ibox.fill.fore_color.rgb = COLOR_SOFT_PURPLE
        ibox.line.color.rgb = COLOR_BORDER_PURPLE
        ibox.line.width = Pt(1)
        tf_i = ibox.text_frame
        tf_i.word_wrap = True
        tf_i.margin_left = Inches(0.12)
        tf_i.margin_right = Inches(0.12)
        tf_i.margin_top = Inches(0.06)
        p1 = tf_i.paragraphs[0]
        p1.text = head
        p1.font.name = "Segoe UI"
        p1.font.size = Pt(10)
        p1.font.bold = True
        p1.font.color.rgb = COLOR_DARK_PURPLE
        p2 = tf_i.add_paragraph()
        p2.text = text
        p2.font.name = "Segoe UI"
        p2.font.size = Pt(8.5)
        p2.font.color.rgb = COLOR_TEXT_MUTED

    # Right Container: Future Enhancements Roadmap
    right_box = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.833), Inches(1.80), half_w, Inches(4.55))
    right_box.fill.solid()
    right_box.fill.fore_color.rgb = COLOR_BG_WHITE
    right_box.line.color.rgb = COLOR_ACCENT_ORANGE
    right_box.line.width = Pt(1.5)

    r_hdr = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.983), Inches(1.95), half_w - Inches(0.3), Inches(0.48))
    r_hdr.fill.solid()
    r_hdr.fill.fore_color.rgb = COLOR_ACCENT_ORANGE
    r_hdr.line.fill.background()
    tf_rh = r_hdr.text_frame
    tf_rh.vertical_anchor = MSO_ANCHOR.MIDDLE
    p_rh = tf_rh.paragraphs[0]
    p_rh.text = "🚀 Future Enhancements & Technological Roadmap"
    p_rh.font.name = "Segoe UI"
    p_rh.font.size = Pt(12)
    p_rh.font.bold = True
    p_rh.font.color.rgb = COLOR_BG_WHITE
    p_rh.alignment = PP_ALIGN.CENTER

    roadmap_items = [
        ("🤖 Phase 1: AI Study Assistant & Chat with Notes", "Integrate LLM API to enable natural-language Q&A directly on uploaded notes, automatic concept summarization, and mock quiz generation."),
        ("📱 Phase 2: Dedicated Mobile App (Android & iOS)", "Develop React Native / Flutter cross-platform mobile app with offline note caching and push alerts for newly uploaded question papers."),
        ("💬 Phase 3: Peer Discussion & Doubt Solving Forum", "Add interactive discussion threads where students can tag faculty, ask subject-specific doubts, and upvote the best student answers."),
        ("📊 Phase 4: Student Learning Analytics Dashboard", "Provide student performance metrics, personal reading history bookmarks, and exam preparation readiness trackers.")
    ]

    for idx, (head, text) in enumerate(roadmap_items):
        iy = Inches(2.55) + idx * Inches(0.92)
        ibox = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.983), iy, half_w - Inches(0.3), Inches(0.82))
        ibox.fill.solid()
        ibox.fill.fore_color.rgb = COLOR_ORANGE_LIGHT
        ibox.line.color.rgb = RGBColor(0xFD, 0xBA, 0x74)
        ibox.line.width = Pt(1)
        tf_i = ibox.text_frame
        tf_i.word_wrap = True
        tf_i.margin_left = Inches(0.12)
        tf_i.margin_right = Inches(0.12)
        tf_i.margin_top = Inches(0.06)
        p1 = tf_i.paragraphs[0]
        p1.text = head
        p1.font.name = "Segoe UI"
        p1.font.size = Pt(10)
        p1.font.bold = True
        p1.font.color.rgb = COLOR_ACCENT_ORANGE
        p2 = tf_i.add_paragraph()
        p2.text = text
        p2.font.name = "Segoe UI"
        p2.font.size = Pt(8.5)
        p2.font.color.rgb = COLOR_TEXT_MUTED

    # Bottom Metric Banner
    bot_banner = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(6.50), Inches(11.733), Inches(0.60))
    bot_banner.fill.solid()
    bot_banner.fill.fore_color.rgb = COLOR_SOFT_PURPLE
    bot_banner.line.color.rgb = COLOR_BORDER_PURPLE
    bot_banner.line.width = Pt(1.5)
    tf_bb = bot_banner.text_frame
    tf_bb.vertical_anchor = MSO_ANCHOR.MIDDLE
    tf_bb.margin_left = Inches(0.20)
    p_bb = tf_bb.paragraphs[0]
    p_bb.text = "⭐ Key Takeaway: The portal successfully solves material fragmentation, establishes an autonomous learning hub, and lays a scalable foundation for modern digital education at PMC TECH."
    p_bb.font.name = "Segoe UI"
    p_bb.font.size = Pt(10)
    p_bb.font.bold = True
    p_bb.font.color.rgb = COLOR_ROYAL_VIOLET


    # =========================================================================
    # SLIDE 8: FINAL THANK YOU SLIDE (CREATIVE GLOWING ART)
    # =========================================================================
    s8 = prs.slides.add_slide(blank_layout)

    bg_art = "presentation_assets/thankyou_bg_art.jpg"
    if os.path.exists(bg_art):
        s8.shapes.add_picture(bg_art, 0, 0, width=Inches(13.333), height=Inches(7.5))
    else:
        bg8 = s8.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg8.fill.solid()
        bg8.fill.fore_color.rgb = COLOR_DARK_PURPLE
        bg8.line.fill.background()

    card_thank = s8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.8), Inches(0.95), Inches(9.733), Inches(5.60))
    card_thank.fill.solid()
    card_thank.fill.fore_color.rgb = RGBColor(0x18, 0x0A, 0x2C)
    card_thank.line.color.rgb = RGBColor(0xA7, 0x8B, 0xFA)
    card_thank.line.width = Pt(2)

    # Thank you header
    tb_thank = s8.shapes.add_textbox(Inches(2.0), Inches(1.20), Inches(9.333), Inches(1.30))
    tf_th = tb_thank.text_frame
    tf_th.word_wrap = True
    p_th = tf_th.paragraphs[0]
    p_th.text = "THANK YOU!"
    p_th.font.name = "Segoe UI"
    p_th.font.size = Pt(50)
    p_th.font.bold = True
    p_th.font.color.rgb = COLOR_BG_WHITE
    p_th.alignment = PP_ALIGN.CENTER

    p_th2 = tf_th.add_paragraph()
    p_th2.text = "Student Study Resource Portal"
    p_th2.font.name = "Segoe UI"
    p_th2.font.size = Pt(19)
    p_th2.font.bold = True
    p_th2.font.color.rgb = RGBColor(0xDD, 0xD6, 0xFE)
    p_th2.alignment = PP_ALIGN.CENTER

    # Questions & Answers Badge
    qa_badge = s8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(4.3), Inches(2.70), Inches(4.733), Inches(0.48))
    qa_badge.fill.solid()
    qa_badge.fill.fore_color.rgb = COLOR_ACCENT_ORANGE
    qa_badge.line.fill.background()
    tf_qa = qa_badge.text_frame
    tf_qa.vertical_anchor = MSO_ANCHOR.MIDDLE
    p_qa = tf_qa.paragraphs[0]
    p_qa.text = "💡 QUESTIONS & ANSWERS / DISCUSSION"
    p_qa.font.name = "Segoe UI"
    p_qa.font.size = Pt(11)
    p_qa.font.bold = True
    p_qa.font.color.rgb = COLOR_BG_WHITE
    p_qa.alignment = PP_ALIGN.CENTER

    # Bottom team and guide credits
    tb_foot = s8.shapes.add_textbox(Inches(2.0), Inches(3.35), Inches(9.333), Inches(3.0))
    tf_ft = tb_foot.text_frame
    tf_ft.word_wrap = True
    
    p_f1 = tf_ft.paragraphs[0]
    p_f1.text = "Presented By:"
    p_f1.font.name = "Segoe UI"
    p_f1.font.size = Pt(11)
    p_f1.font.color.rgb = RGBColor(0xC4, 0xB5, 0xFD)
    p_f1.alignment = PP_ALIGN.CENTER

    p_f2 = tf_ft.add_paragraph()
    p_f2.text = "S. Keerthana   •   G. Kirthimaha   •   K. Keerthana   •   R. Madhu Shri   •   S. Madhumita"
    p_f2.font.name = "Segoe UI"
    p_f2.font.size = Pt(13)
    p_f2.font.bold = True
    p_f2.font.color.rgb = COLOR_BG_WHITE
    p_f2.alignment = PP_ALIGN.CENTER

    p_f2_sub = tf_ft.add_paragraph()
    p_f2_sub.text = "(B.Tech - Information Technology)"
    p_f2_sub.font.name = "Segoe UI"
    p_f2_sub.font.size = Pt(10)
    p_f2_sub.font.color.rgb = RGBColor(0xDD, 0xD6, 0xFE)
    p_f2_sub.alignment = PP_ALIGN.CENTER

    p_g_sep = tf_ft.add_paragraph()
    p_g_sep.text = "────────────────────────────────────────"
    p_g_sep.font.name = "Segoe UI"
    p_g_sep.font.size = Pt(8)
    p_g_sep.font.color.rgb = RGBColor(0x7C, 0x3A, 0xED)
    p_g_sep.alignment = PP_ALIGN.CENTER

    p_guides = tf_ft.add_paragraph()
    p_guides.text = "Staff Guide: Dr. Sathish (HOD)      |      Student Guide: M. Sowbhagya Lakshmi (Student)"
    p_guides.font.name = "Segoe UI"
    p_guides.font.size = Pt(11.5)
    p_guides.font.bold = True
    p_guides.font.color.rgb = RGBColor(0xFF, 0xED, 0xD5)
    p_guides.alignment = PP_ALIGN.CENTER

    p_f3 = tf_ft.add_paragraph()
    p_f3.text = "DEPARTMENT OF INFORMATION TECHNOLOGY"
    p_f3.font.name = "Segoe UI"
    p_f3.font.size = Pt(11)
    p_f3.font.bold = True
    p_f3.font.color.rgb = COLOR_ACCENT_ORANGE
    p_f3.alignment = PP_ALIGN.CENTER

    p_f4 = tf_ft.add_paragraph()
    p_f4.text = "ER. PERUMAL MANIMEKALAI COLLEGE OF ENGINEERING, HOSUR – 635 117"
    p_f4.font.name = "Segoe UI"
    p_f4.font.size = Pt(10.5)
    p_f4.font.color.rgb = RGBColor(0xEE, 0xEA, 0xF9)
    p_f4.alignment = PP_ALIGN.CENTER

    # Save to official presentation file
    output_filename = "Student_Study_Resource_Portal.pptx"
    prs.save(output_filename)
    print(f"Successfully generated 8-slide presentation: {output_filename}")

    # Also render slide previews using PowerPoint automation if available
    try:
        import win32com.client
        ppt_app = win32com.client.Dispatch("PowerPoint.Application")
        abs_path = os.path.abspath(output_filename)
        pres = ppt_app.Presentations.Open(abs_path, WithWindow=False)
        os.makedirs("slide_previews", exist_ok=True)
        # Remove old previews
        for f in os.listdir("slide_previews"):
            if f.endswith(".png"):
                os.remove(os.path.join("slide_previews", f))
        for i, s in enumerate(pres.Slides):
            out_img = os.path.abspath(f"slide_previews/slide_{i+1:02d}.png")
            s.Export(out_img, "PNG")
            print(f"Exported preview: slide_{i+1:02d}.png")
        pres.Close()
        ppt_app.Quit()
        print("All slide previews successfully exported!")
    except Exception as e:
        print(f"Preview export notice: {e}")

if __name__ == "__main__":
    build_presentation()
