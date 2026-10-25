import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

# ==========================================
# COLOR PALETTE DEFINITIONS (LIGHT THEME)
# ==========================================
COLOR_BG_LIGHT = RGBColor(0xF6, 0xF3, 0xFC)       # Light Lavender White
COLOR_BG_WHITE = RGBColor(0xFF, 0xFF, 0xFF)       # Pure White
COLOR_DARK_PURPLE = RGBColor(0x2D, 0x12, 0x4D)    # Rich Deep Purple
COLOR_ROYAL_VIOLET = RGBColor(0x63, 0x27, 0x9B)   # Royal Violet
COLOR_ACCENT_PURPLE = RGBColor(0x7C, 0x3A, 0xED)  # Vibrant Purple
COLOR_SOFT_PURPLE = RGBColor(0xEE, 0xEA, 0xF9)    # Soft Lavender Fill
COLOR_BORDER_PURPLE = RGBColor(0xC4, 0xB5, 0xFD)  # Light Border Purple
COLOR_ACCENT_ORANGE = RGBColor(0xEA, 0x58, 0x0C)  # Bright Orange
COLOR_ORANGE_LIGHT = RGBColor(0xFF, 0xF7, 0xED)   # Soft Orange Fill
COLOR_TEXT_DARK = RGBColor(0x1E, 0x1B, 0x4B)      # Slate Dark Navy
COLOR_TEXT_MUTED = RGBColor(0x47, 0x55, 0x69)     # Slate Gray
COLOR_EMERALD = RGBColor(0x05, 0x96, 0x69)        # Emerald Green
COLOR_CYAN = RGBColor(0x02, 0x84, 0xC7)           # Cyan Blue

def create_presentation():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Helper function to set light slide background
    def set_slide_bg(slide, color=COLOR_BG_LIGHT):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = color
        bg.line.fill.background()
        return bg

    # Helper function for light slide header
    def add_slide_header(slide, title_text, category_text="STUDENT STUDY RESOURCE PORTAL"):
        # Category pill
        cat_shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.42), Inches(3.6), Inches(0.32))
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
        tb = slide.shapes.add_textbox(Inches(0.75), Inches(0.78), Inches(11.8), Inches(0.75))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title_text
        p.font.name = "Segoe UI"
        p.font.size = Pt(24)
        p.font.bold = True
        p.font.color.rgb = COLOR_DARK_PURPLE

        # Accent top-right line
        line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.58), Inches(11.733), Inches(0.02))
        line.fill.solid()
        line.fill.fore_color.rgb = RGBColor(0xE2, 0xD9, 0xF3)
        line.line.fill.background()

    # =========================================================================
    # SLIDE 1: EXACT MATCH TO USER SPECIFICATION & REFERENCE IMAGE
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)
    set_slide_bg(s1, COLOR_BG_LIGHT)

    # 1. Logo at Top-Left (Transparent PNG)
    logo_path = "presentation_assets/pmc_tech_logo_transparent.png"
    if not os.path.exists(logo_path):
        logo_path = "presentation_assets/pmc_tech_logo.png"
    if os.path.exists(logo_path):
        s1.shapes.add_picture(logo_path, Inches(0.8), Inches(0.42), width=Inches(1.85))

    # 2. College & Department Details at Top-Right
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

    # 3. Thin purple horizontal line below header
    top_line = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.68), Inches(11.733), Inches(0.035))
    top_line.fill.solid()
    top_line.fill.fore_color.rgb = COLOR_ACCENT_PURPLE
    top_line.line.fill.background()

    # 4. Large Rectangular Title Box with Purple Border
    title_box = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(2.0), Inches(11.733), Inches(1.72))
    title_box.fill.solid()
    title_box.fill.fore_color.rgb = COLOR_BG_WHITE
    title_box.line.color.rgb = COLOR_ROYAL_VIOLET
    title_box.line.width = Pt(2.5)

    # Orange Label "PROJECT TITLE"
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

    # 5. Bottom-Left: "PRESENTED BY" Large Rounded Rectangle
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

    # 6. Bottom-Right: STAFF GUIDE Section
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

    # 7. Bottom-Right: STUDENT GUIDE Section
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
    # SLIDE 2: INTRODUCTION & OVERVIEW (LIGHT THEME)
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    set_slide_bg(s2)
    add_slide_header(s2, "Introduction & Project Vision", "PROJECT OVERVIEW")

    card_w = Inches(6.0)
    card_h = Inches(1.52)
    left_x = Inches(0.8)

    intro_points = [
        ("🎓 Academic Challenge Solved", 
         "Resolves widespread fragmentation of lecture notes, lab files, and syllabus materials scattered across unorganized chat groups, cloud folders, and loose paper notes.", COLOR_ROYAL_VIOLET),
        ("🚀 All-in-One Learning Portal", 
         "A high-performance Single-Page Application (SPA) providing exam-oriented notes, syntax-highlighted code snippets, and active study aids for engineering subjects.", COLOR_ACCENT_ORANGE),
        ("💻 Interactive & Offline Ready", 
         "Empowers students with instant one-click code copy, client-side .txt note generation, and clean multipage print-to-PDF export directly within the browser.", COLOR_ACCENT_PURPLE)
    ]

    for i, (head, desc, clr) in enumerate(intro_points):
        cy = Inches(1.85) + i * (card_h + Inches(0.24))
        card = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left_x, cy, card_w, card_h)
        card.fill.solid()
        card.fill.fore_color.rgb = COLOR_BG_WHITE
        card.line.color.rgb = COLOR_BORDER_PURPLE
        card.line.width = Pt(1.5)

        # Left color bar
        bar = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left_x, cy, Inches(0.18), card_h)
        bar.fill.solid()
        bar.fill.fore_color.rgb = clr
        bar.line.fill.background()

        tbox = s2.shapes.add_textbox(left_x + Inches(0.35), cy + Inches(0.15), card_w - Inches(0.5), card_h - Inches(0.3))
        tf = tbox.text_frame
        tf.word_wrap = True
        p1 = tf.paragraphs[0]
        p1.text = head
        p1.font.name = "Segoe UI"
        p1.font.size = Pt(13.5)
        p1.font.bold = True
        p1.font.color.rgb = COLOR_DARK_PURPLE
        
        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.name = "Segoe UI"
        p2.font.size = Pt(10.5)
        p2.font.color.rgb = COLOR_TEXT_MUTED

    # Right: Concept Illustration
    right_x = Inches(7.1)
    img_intro = "presentation_assets/learning_concept_art.jpg"
    if os.path.exists(img_intro):
        s2.shapes.add_picture(img_intro, right_x, Inches(1.85), width=Inches(5.433), height=Inches(4.15))
        
        cap = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, right_x, Inches(6.15), Inches(5.433), Inches(0.8))
        cap.fill.solid()
        cap.fill.fore_color.rgb = COLOR_BG_WHITE
        cap.line.color.rgb = COLOR_BORDER_PURPLE
        tf_cap = cap.text_frame
        tf_cap.word_wrap = True
        tf_cap.margin_left = Inches(0.2)
        p_c1 = tf_cap.paragraphs[0]
        p_c1.text = "STUDENT-CENTRIC DIGITAL ECOSYSTEM"
        p_c1.font.name = "Segoe UI"
        p_c1.font.size = Pt(10)
        p_c1.font.bold = True
        p_c1.font.color.rgb = COLOR_ACCENT_ORANGE
        p_c2 = tf_cap.add_paragraph()
        p_c2.text = "Verified syllabus content across C, Web Dev, Cloud, Java, and Python."
        p_c2.font.name = "Segoe UI"
        p_c2.font.size = Pt(9.5)
        p_c2.font.color.rgb = COLOR_TEXT_MUTED


    # =========================================================================
    # SLIDE 3: PROBLEM STATEMENT (LIGHT THEME)
    # =========================================================================
    s3 = prs.slides.add_slide(blank_layout)
    set_slide_bg(s3)
    add_slide_header(s3, "Problem Statement & Student Bottlenecks", "CURRENT CHALLENGES")

    grid_w = Inches(5.7)
    grid_h = Inches(2.35)
    
    problems = [
        ("01", "Scattered Learning Materials", 
         "Critical syllabus notes and lab code are dispersed across chat apps (WhatsApp, Telegram), individual Google drives, and handwritten sheets, causing major preparation delays.",
         "⚠️  Bottleneck: 45+ minutes lost hunting across chats per revision", COLOR_ROYAL_VIOLET),
        ("02", "Inconsistent & Unverified Quality", 
         "Informally circulated notes frequently contain syntactical bugs, incomplete derivations, and outdated concepts without faculty or peer verification mechanisms.",
         "❌  Risk: Broken code snippets and exam point deductions", COLOR_ACCENT_ORANGE),
        ("03", "Forwarding Fatigue & File Loss", 
         "Students have no structured way to archive or retrieve peer-contributed study files, leading to duplicated requests, broken download links, and lost documents.",
         "📁  Friction: File links expire and lab manuals vanish", COLOR_ACCENT_PURPLE),
        ("04", "Poor Mobile & Search Experience", 
         "Large scanned PDFs are cumbersome to read on smartphones and lack instant keyword search, forcing students to manually scan hundreds of pages.",
         "📱  Barrier: Hard to study during transit or fast revisions", COLOR_DARK_PURPLE)
    ]

    for idx, (num, title, text, pill_text, col) in enumerate(problems):
        row = idx // 2
        col_idx = idx % 2
        gx = Inches(0.8) + col_idx * (grid_w + Inches(0.33))
        gy = Inches(1.85) + row * (grid_h + Inches(0.25))

        p_card = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, gx, gy, grid_w, grid_h)
        p_card.fill.solid()
        p_card.fill.fore_color.rgb = COLOR_BG_WHITE
        p_card.line.color.rgb = COLOR_BORDER_PURPLE
        p_card.line.width = Pt(1.5)

        # Number badge
        nb = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, gx + Inches(0.25), gy + Inches(0.25), Inches(0.65), Inches(0.65))
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

        tbox = s3.shapes.add_textbox(gx + Inches(1.05), gy + Inches(0.15), grid_w - Inches(1.25), Inches(1.4))
        tf = tbox.text_frame
        tf.word_wrap = True
        p1 = tf.paragraphs[0]
        p1.text = title
        p1.font.name = "Segoe UI"
        p1.font.size = Pt(13.5)
        p1.font.bold = True
        p1.font.color.rgb = COLOR_DARK_PURPLE

        p2 = tf.add_paragraph()
        p2.text = text
        p2.font.name = "Segoe UI"
        p2.font.size = Pt(10)
        p2.font.color.rgb = COLOR_TEXT_MUTED

        # Bottom Impact Pill
        pill = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, gx + Inches(0.25), gy + grid_h - Inches(0.55), grid_w - Inches(0.5), Inches(0.38))
        pill.fill.solid()
        pill.fill.fore_color.rgb = COLOR_SOFT_PURPLE
        pill.line.color.rgb = COLOR_BORDER_PURPLE
        pill.line.width = Pt(1)
        tf_p = pill.text_frame
        tf_p.vertical_anchor = MSO_ANCHOR.MIDDLE
        tf_p.margin_left = Inches(0.15)
        p_pl = tf_p.paragraphs[0]
        p_pl.text = pill_text
        p_pl.font.name = "Segoe UI"
        p_pl.font.size = Pt(9.5)
        p_pl.font.bold = True
        p_pl.font.color.rgb = col


    # =========================================================================
    # SLIDE 4: PROJECT OBJECTIVES (LIGHT THEME)
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    set_slide_bg(s4)
    add_slide_header(s4, "Project Objectives & Design Goals", "CORE GOALS")

    obj_w = Inches(3.75)
    obj_h = Inches(2.35)

    objectives = [
        ("🎯", "Centralize Study Resources", 
         "Create a unified, dependable web platform hosting verified notes across core Computer Science and Engineering disciplines.",
         "Metric: Single source of truth for 5 core disciplines"),
        ("⚡", "Deliver Fast Concept Discovery", 
         "Implement real-time keyword search and AI topic chips for instant retrieval of technical syllabus sections.",
         "Metric: Sub-millisecond instant client matching"),
        ("💻", "Facilitate Active Learning", 
         "Provide pre-formatted runnable code snippets with one-click copy to encourage practical hands-on programming.",
         "Metric: 1-click clipboard integration with visual feedback"),
        ("📤", "Enable Peer Contribution", 
         "Empower students to upload notes and lab solutions with automated server processing and administrative moderation.",
         "Metric: Secure multer file handling up to 25 MB"),
        ("📄", "Support Offline Revisions", 
         "Integrate client-side text file generation and browser print-to-PDF export for frictionless exam hall study.",
         "Metric: HTML5 Blob export & @media print support"),
        ("🔐", "Ensure Account Security", 
         "Implement robust user authentication with bcryptjs salted password hashing and server-side session control.",
         "Metric: Encrypted sessions & SQL injection protection")
    ]

    for idx, (icon, title, desc, kpi) in enumerate(objectives):
        row = idx // 3
        col_idx = idx % 3
        ox = Inches(0.8) + col_idx * (obj_w + Inches(0.24))
        oy = Inches(1.85) + row * (obj_h + Inches(0.25))

        card = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, ox, oy, obj_w, obj_h)
        card.fill.solid()
        card.fill.fore_color.rgb = COLOR_BG_WHITE
        card.line.color.rgb = COLOR_BORDER_PURPLE
        card.line.width = Pt(1.5)

        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_left = Inches(0.2)
        tf.margin_right = Inches(0.2)
        tf.margin_top = Inches(0.2)
        
        p1 = tf.paragraphs[0]
        p1.text = f"{icon}  {title}"
        p1.font.name = "Segoe UI"
        p1.font.size = Pt(13)
        p1.font.bold = True
        p1.font.color.rgb = COLOR_DARK_PURPLE

        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.name = "Segoe UI"
        p2.font.size = Pt(10)
        p2.font.color.rgb = COLOR_TEXT_MUTED

        # KPI Pill
        kpill = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, ox + Inches(0.15), oy + obj_h - Inches(0.52), obj_w - Inches(0.3), Inches(0.36))
        kpill.fill.solid()
        kpill.fill.fore_color.rgb = COLOR_SOFT_PURPLE
        kpill.line.color.rgb = COLOR_BORDER_PURPLE
        kpill.line.width = Pt(1)
        tf_kp = kpill.text_frame
        tf_kp.vertical_anchor = MSO_ANCHOR.MIDDLE
        tf_kp.margin_left = Inches(0.1)
        p_kp = tf_kp.paragraphs[0]
        p_kp.text = f"★  {kpi}"
        p_kp.font.name = "Segoe UI"
        p_kp.font.size = Pt(8.8)
        p_kp.font.bold = True
        p_kp.font.color.rgb = COLOR_ROYAL_VIOLET


    # =========================================================================
    # SLIDE 5: EXISTING SYSTEM VS PROPOSED SYSTEM (LIGHT THEME)
    # =========================================================================
    s5 = prs.slides.add_slide(blank_layout)
    set_slide_bg(s5)
    add_slide_header(s5, "Comparative Analysis: Existing vs. Proposed System", "SYSTEM COMPARISON")

    rows, cols = 6, 3
    table_shape = s5.shapes.add_table(rows, cols, Inches(0.8), Inches(1.85), Inches(11.733), Inches(4.9))
    tbl = table_shape.table
    tbl.columns[0].width = Inches(2.6)
    tbl.columns[1].width = Inches(4.566)
    tbl.columns[2].width = Inches(4.566)

    headers = ["Evaluation Metric", "❌ Existing System (Manual / Chat-Based)", "✅ Proposed Portal (StudyPortal Pro)"]
    data = [
        ("Resource Storage", "Fragmented across individual WhatsApp groups, personal Google Drives, and paper folders.", "Unified central repository organized cleanly by academic subjects and tags."),
        ("Search & Retrieval", "Slow, manual browsing through chat histories and disorganized folder directories.", "Instant real-time search with interactive subject filter chips and AI study chips."),
        ("Code Snippets", "Shared as raw unformatted text or blurry screenshots with syntax errors.", "Syntax-formatted code blocks with animated one-click copy to clipboard."),
        ("Offline Study", "Requires downloading heavy, bulky PDFs that are difficult to view on smartphones.", "Direct .txt notes download via HTML5 Blob and clean browser print-to-PDF."),
        ("Access & Moderation", "No verification mechanism; spam and incorrect materials circulate freely.", "Secure student authentication with bcryptjs and admin moderation console.")
    ]

    for c, h_text in enumerate(headers):
        cell = tbl.cell(0, c)
        cell.fill.solid()
        cell.fill.fore_color.rgb = COLOR_DARK_PURPLE if c != 2 else COLOR_ROYAL_VIOLET
        p = cell.text_frame.paragraphs[0]
        p.text = h_text
        p.font.name = "Segoe UI"
        p.font.size = Pt(12)
        p.font.bold = True
        p.font.color.rgb = COLOR_BG_WHITE
        p.alignment = PP_ALIGN.CENTER

    for r, row_data in enumerate(data, start=1):
        bg_row = COLOR_BG_WHITE if r % 2 == 1 else COLOR_SOFT_PURPLE
        for c, cell_text in enumerate(row_data):
            cell = tbl.cell(r, c)
            cell.fill.solid()
            cell.fill.fore_color.rgb = bg_row
            p = cell.text_frame.paragraphs[0]
            p.text = cell_text
            p.font.name = "Segoe UI"
            p.font.size = Pt(10.5)
            if c == 0:
                p.font.bold = True
                p.font.color.rgb = COLOR_DARK_PURPLE
            elif c == 1:
                p.font.color.rgb = RGBColor(0x99, 0x1B, 0x1B)  # Dark Red
            else:
                p.font.color.rgb = RGBColor(0x06, 0x5F, 0x46)  # Dark Green


    # =========================================================================
    # SLIDE 6: KEY FEATURES & MODULES (LIGHT THEME)
    # =========================================================================
    s6 = prs.slides.add_slide(blank_layout)
    set_slide_bg(s6)
    add_slide_header(s6, "Six Core Functional Modules", "PORTAL FEATURES")

    mod_w = Inches(3.75)
    mod_h = Inches(2.35)

    modules = [
        ("🏠", "Home & Dashboard", 
         "Academic year banner, feature highlight pills, quick CTA navigation, and live statistics counter.",
         ["• Academic Year 2026 Hub Banner", "• Verified notes & subject counters", "• Direct CTA shortcut routing"]),
        ("📚", "Curated Resources", 
         "Curriculum-aligned library with real-time keyword search, subject chips, and reading time badges.",
         ["• Real-time title & topic filter", "• C, Web, Cloud, Java, Python", "• Estimated reading time pills"]),
        ("🤖", "AI Study Assistant", 
         "Natural-language topic search engine matching keywords across syllabus titles and summaries.",
         ["• Instant conceptual keyword match", "• Pre-configured topic study chips", "• Sub-millisecond client query"]),
        ("📤", "Contribute / Upload", 
         "Authenticated file upload system utilizing multer diskStorage for community notes & lab PDFs.",
         ["• Express multer upload engine", "• Files up to 25 MB supported", "• Dynamic library card addition"]),
        ("🛠️", "Admin Console", 
         "Restricted dashboard for platform moderation, allowing administrators to review contributions.",
         ["• Community submission queue", "• Approve & Publish actions", "• Dynamic card state updating"]),
        ("🔐", "Auth & Student Profile", 
         "Secure registration and login workflow utilizing bcryptjs salted hashing and session cookies.",
         ["• bcryptjs salted password hashing", "• express-session cookie storage", "• Dynamic nav greeting & sign out"])
    ]

    for idx, (icon, title, desc, sub_bullets) in enumerate(modules):
        row = idx // 3
        col_idx = idx % 3
        mx = Inches(0.8) + col_idx * (mod_w + Inches(0.24))
        my = Inches(1.85) + row * (mod_h + Inches(0.25))

        card = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, mx, my, mod_w, mod_h)
        card.fill.solid()
        card.fill.fore_color.rgb = COLOR_BG_WHITE
        card.line.color.rgb = COLOR_BORDER_PURPLE
        card.line.width = Pt(1.5)

        # Header bar inside card
        hbar = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, mx + Inches(0.15), my + Inches(0.15), mod_w - Inches(0.3), Inches(0.42))
        hbar.fill.solid()
        hbar.fill.fore_color.rgb = COLOR_SOFT_PURPLE
        hbar.line.fill.background()
        tf_hb = hbar.text_frame
        tf_hb.vertical_anchor = MSO_ANCHOR.MIDDLE
        p_hb = tf_hb.paragraphs[0]
        p_hb.text = f"{icon}  {title}"
        p_hb.font.name = "Segoe UI"
        p_hb.font.size = Pt(12)
        p_hb.font.bold = True
        p_hb.font.color.rgb = COLOR_DARK_PURPLE

        tb = s6.shapes.add_textbox(mx + Inches(0.15), my + Inches(0.6), mod_w - Inches(0.3), Inches(0.85))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = desc
        p.font.name = "Segoe UI"
        p.font.size = Pt(9.5)
        p.font.color.rgb = COLOR_TEXT_MUTED

        bb = s6.shapes.add_textbox(mx + Inches(0.15), my + Inches(1.45), mod_w - Inches(0.3), Inches(0.8))
        tf_bb = bb.text_frame
        tf_bb.word_wrap = True
        for b_text in sub_bullets:
            p_b = tf_bb.add_paragraph() if tf_bb.paragraphs[0].text else tf_bb.paragraphs[0]
            p_b.text = b_text
            p_b.font.name = "Segoe UI"
            p_b.font.size = Pt(8.8)
            p_b.font.color.rgb = COLOR_ROYAL_VIOLET


    # =========================================================================
    # SLIDE 7: TECHNOLOGY STACK (LIGHT THEME)
    # =========================================================================
    s7 = prs.slides.add_slide(blank_layout)
    set_slide_bg(s7)
    add_slide_header(s7, "Technology Stack & Architectural Components", "TECH STACK")

    tech_cols = [
        ("Frontend Layer", COLOR_ROYAL_VIOLET, [
            ("HTML5 Semantic Markup", "Clean document layout (<header>, <nav>, <section>, modals)"),
            ("Vanilla CSS3 Tokens", "Custom CSS variables, glassmorphic styling, and @media print"),
            ("Vanilla JavaScript ES6+", "Client-side SPA controller, event listeners, and fetch API calls"),
            ("Typography System", "Google Fonts (Outfit, Plus Jakarta Sans, JetBrains Mono)")
        ]),
        ("Backend Server", COLOR_ACCENT_ORANGE, [
            ("Node.js Runtime", "High-performance, event-driven asynchronous JavaScript runtime"),
            ("Express.js v5.1.0", "Fast RESTful API endpoints, routing, and static asset serving"),
            ("express-session", "Encrypted cookie-based student session lifecycle management"),
            ("multer Engine", "Multipart form-data processor with 25MB disk limits in public/uploads/")
        ]),
        ("Database & Security", COLOR_ACCENT_PURPLE, [
            ("SQLite (better-sqlite3)", "Embedded zero-config database storing credentials in studyportal.db"),
            ("PostgreSQL / Neon", "Cloud-native PostgreSQL compatibility for production scalability"),
            ("bcryptjs v2.4.3", "Adaptive salted password hashing preventing plaintext credential leaks"),
            ("Prepared SQL Queries", "Pre-compiled parameterized statements protecting against SQL injection")
        ])
    ]

    col_w = Inches(3.75)
    for c_idx, (cat_name, cat_clr, items) in enumerate(tech_cols):
        cx = Inches(0.8) + c_idx * (col_w + Inches(0.24))
        cy = Inches(1.85)
        
        container = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, cx, cy, col_w, Inches(4.95))
        container.fill.solid()
        container.fill.fore_color.rgb = COLOR_BG_WHITE
        container.line.color.rgb = COLOR_BORDER_PURPLE
        container.line.width = Pt(1.5)

        # Header banner
        hdr = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, cx + Inches(0.15), cy + Inches(0.15), col_w - Inches(0.3), Inches(0.55))
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
            iy = cy + Inches(0.85) + i_idx * Inches(0.98)
            item_box = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, cx + Inches(0.15), iy, col_w - Inches(0.3), Inches(0.88))
            item_box.fill.solid()
            item_box.fill.fore_color.rgb = COLOR_SOFT_PURPLE
            item_box.line.color.rgb = COLOR_BORDER_PURPLE
            item_box.line.width = Pt(1)
            
            tf_i = item_box.text_frame
            tf_i.word_wrap = True
            tf_i.margin_left = Inches(0.15)
            tf_i.margin_right = Inches(0.15)
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
    # SLIDE 8: SYSTEM ARCHITECTURE (LIGHT THEME)
    # =========================================================================
    s8 = prs.slides.add_slide(blank_layout)
    set_slide_bg(s8)
    add_slide_header(s8, "Three-Tier System Architecture", "SYSTEM ARCHITECTURE")

    tier_w = Inches(11.733)
    tier_h = Inches(1.4)
    tx = Inches(0.8)

    tiers = [
        ("Tier 1: Presentation Layer (Browser Client)", COLOR_ROYAL_VIOLET, [
            ("HTML5 & CSS3 SPA", "Responsive views with glassmorphic cards and modal dialogs"),
            ("app.js Controller", "DOM manipulation, client state, and real-time search logic"),
            ("PDF & Text Exporter", "HTML5 Blob text assembler & browser print-to-PDF engine")
        ]),
        ("Tier 2: Application Layer (Node.js & Express.js)", COLOR_ACCENT_ORANGE, [
            ("REST API Endpoints", "/api/register, /api/login, /api/upload, /api/session"),
            ("Security & Hashing", "bcryptjs salted password hashing & session management"),
            ("File Upload Engine", "multer diskStorage processor saving to public/uploads/")
        ]),
        ("Tier 3: Data & Storage Layer (Database & Files)", COLOR_ACCENT_PURPLE, [
            ("SQLite / PostgreSQL", "Relational persistence storing user credentials & roles"),
            ("Local Disk Storage", "Timestamped, sanitized uploaded study files and PDFs"),
            ("Prepared SQL Queries", "Pre-compiled parameterized statements protecting data")
        ])
    ]

    for idx, (t_name, t_clr, sub_items) in enumerate(tiers):
        ty = Inches(1.85) + idx * (tier_h + Inches(0.35))
        
        t_card = s8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, tx, ty, tier_w, tier_h)
        t_card.fill.solid()
        t_card.fill.fore_color.rgb = COLOR_BG_WHITE
        t_card.line.color.rgb = COLOR_BORDER_PURPLE
        t_card.line.width = Pt(1.5)

        lp = s8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, tx + Inches(0.15), ty + Inches(0.15), Inches(3.2), tier_h - Inches(0.3))
        lp.fill.solid()
        lp.fill.fore_color.rgb = t_clr
        lp.line.fill.background()
        tf_lp = lp.text_frame
        tf_lp.word_wrap = True
        tf_lp.vertical_anchor = MSO_ANCHOR.MIDDLE
        p_lp = tf_lp.paragraphs[0]
        p_lp.text = t_name
        p_lp.font.name = "Segoe UI"
        p_lp.font.size = Pt(12)
        p_lp.font.bold = True
        p_lp.font.color.rgb = COLOR_BG_WHITE
        p_lp.alignment = PP_ALIGN.CENTER

        sub_w = Inches(2.6)
        for s_idx, (stitle, sdesc) in enumerate(sub_items):
            sx = tx + Inches(3.55) + s_idx * (sub_w + Inches(0.18))
            sy = ty + Inches(0.15)
            s_box = s8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, sx, sy, sub_w, tier_h - Inches(0.3))
            s_box.fill.solid()
            s_box.fill.fore_color.rgb = COLOR_SOFT_PURPLE
            s_box.line.color.rgb = COLOR_BORDER_PURPLE
            s_box.line.width = Pt(1)

            tf_s = s_box.text_frame
            tf_s.word_wrap = True
            tf_s.margin_left = Inches(0.12)
            tf_s.margin_right = Inches(0.12)
            p_st = tf_s.paragraphs[0]
            p_st.text = stitle
            p_st.font.name = "Segoe UI"
            p_st.font.size = Pt(10.5)
            p_st.font.bold = True
            p_st.font.color.rgb = COLOR_DARK_PURPLE

            p_sd = tf_s.add_paragraph()
            p_sd.text = sdesc
            p_sd.font.name = "Segoe UI"
            p_sd.font.size = Pt(9)
            p_sd.font.color.rgb = COLOR_TEXT_MUTED

        if idx < 2:
            arr = s8.shapes.add_shape(MSO_SHAPE.DOWN_ARROW, Inches(6.5), ty + tier_h + Inches(0.05), Inches(0.4), Inches(0.25))
            arr.fill.solid()
            arr.fill.fore_color.rgb = COLOR_ACCENT_ORANGE
            arr.line.fill.background()


    # =========================================================================
    # SLIDE 9: WORKING PROCESS & USER WORKFLOW (LIGHT THEME)
    # =========================================================================
    s9 = prs.slides.add_slide(blank_layout)
    set_slide_bg(s9)
    add_slide_header(s9, "Working Process & Operational User Workflow", "WORKFLOW")

    step_w = Inches(2.7)
    step_h = Inches(4.85)

    steps = [
        ("Step 1", "🔐 Authentication & Session Setup", 
         "Student enters credentials on Register/Login page. Backend hashes password via bcryptjs, verifies uniqueness in SQLite, and sets encrypted session cookie.",
         "POST /api/login", COLOR_ROYAL_VIOLET,
         ["• Email validation check", "• Salted bcryptjs hashing", "• express-session cookie set"]),
        ("Step 2", "🔍 Subject Filtering & AI Search", 
         "Student navigates to Resources or AI Search. Real-time event listeners filter syllabus notes by subject chips or query keywords across titles and summaries.",
         "Instant Client Matching", COLOR_ACCENT_ORANGE,
         ["• Real-time input listener", "• Subject chip toggle", "• Fast multi-field query match"]),
        ("Step 3", "📖 Interactive Study & Code Copy", 
         "Clicking 'View Resource' opens modal with structured syllabus breakdowns, comparison tables, and code snippets. One-click copy copies code to clipboard.",
         "Modal Reader Component", COLOR_ACCENT_PURPLE,
         ["• Full syllabus breakdown", "• Syntax-styled code box", "• One-click clipboard copy"]),
        ("Step 4", "📥 Offline Export & Contribution", 
         "Student can download .txt notes via HTML5 Blob or print clean PDFs. Authenticated students upload their own study files via multer for community access.",
         "POST /api/upload & Print", COLOR_DARK_PURPLE,
         ["• Blob .txt file export", "• Clean @media print PDF", "• Multer upload with review"])
    ]

    for idx, (step_num, title, text, badge, col, b_list) in enumerate(steps):
        sx = Inches(0.8) + idx * (step_w + Inches(0.27))
        sy = Inches(1.85)

        card = s9.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, sx, sy, step_w, step_h)
        card.fill.solid()
        card.fill.fore_color.rgb = COLOR_BG_WHITE
        card.line.color.rgb = COLOR_BORDER_PURPLE
        card.line.width = Pt(1.5)

        # Step Pill
        spill = s9.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, sx + Inches(0.15), sy + Inches(0.15), Inches(1.1), Inches(0.35))
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
        tb = s9.shapes.add_textbox(sx + Inches(0.15), sy + Inches(0.55), step_w - Inches(0.3), Inches(0.95))
        tf = tb.text_frame
        tf.word_wrap = True
        p_t = tf.paragraphs[0]
        p_t.text = title
        p_t.font.name = "Segoe UI"
        p_t.font.size = Pt(12)
        p_t.font.bold = True
        p_t.font.color.rgb = COLOR_DARK_PURPLE

        # Body text
        tb2 = s9.shapes.add_textbox(sx + Inches(0.15), sy + Inches(1.55), step_w - Inches(0.3), Inches(1.6))
        tf2 = tb2.text_frame
        tf2.word_wrap = True
        p_b = tf2.paragraphs[0]
        p_b.text = text
        p_b.font.name = "Segoe UI"
        p_b.font.size = Pt(9.8)
        p_b.font.color.rgb = COLOR_TEXT_MUTED

        # Bullet highlights
        tb3 = s9.shapes.add_textbox(sx + Inches(0.15), sy + Inches(3.25), step_w - Inches(0.3), Inches(0.95))
        tf3 = tb3.text_frame
        tf3.word_wrap = True
        for b in b_list:
            p_bl = tf3.add_paragraph() if tf3.paragraphs[0].text else tf3.paragraphs[0]
            p_bl.text = b
            p_bl.font.name = "Segoe UI"
            p_bl.font.size = Pt(9)
            p_bl.font.color.rgb = col

        # Bottom badge
        bb = s9.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, sx + Inches(0.15), sy + step_h - Inches(0.58), step_w - Inches(0.3), Inches(0.42))
        bb.fill.solid()
        bb.fill.fore_color.rgb = COLOR_SOFT_PURPLE
        bb.line.color.rgb = COLOR_BORDER_PURPLE
        bb.line.width = Pt(1)
        tf_bb = bb.text_frame
        tf_bb.vertical_anchor = MSO_ANCHOR.MIDDLE
        p_bb = tf_bb.paragraphs[0]
        p_bb.text = f"⚙️  {badge}"
        p_bb.font.name = "Segoe UI"
        p_bb.font.size = Pt(9.2)
        p_bb.font.bold = True
        p_bb.font.color.rgb = col
        p_bb.alignment = PP_ALIGN.CENTER


    # =========================================================================
    # SLIDE 10: USER INTERFACE SHOWCASE (LIGHT THEME)
    # =========================================================================
    s10 = prs.slides.add_slide(blank_layout)
    set_slide_bg(s10)
    add_slide_header(s10, "User Interface & Experience Design", "PORTAL SHOWCASE")

    # Left: High-resolution mockup image
    img_ui = "presentation_assets/portal_ui_mockup.jpg"
    if os.path.exists(img_ui):
        s10.shapes.add_picture(img_ui, Inches(0.8), Inches(1.85), width=Inches(7.2), height=Inches(4.9))

    rx = Inches(8.25)
    rw = Inches(4.283)
    rh = Inches(1.48)

    ui_highlights = [
        ("🎨 Dark Glassmorphic Aesthetic", 
         "Curated navy-slate backdrop (#0a0f1d) combined with indigo-violet gradients and subtle glassmorphic blur borders for zero eye strain during night study.", COLOR_ROYAL_VIOLET),
        ("⚡ Interactive AI Search Chips", 
         "Pre-configured conceptual query chips allow students to quickly resolve complex topics (e.g. 'C pointers', 'Flexbox vs Grid', 'Java OOP', 'AWS EC2').", COLOR_ACCENT_ORANGE),
        ("📖 Full-Screen Notes Modal", 
         "Equipped with reading time pills, syntax-highlighted code containers, one-click copy feedback, and print-to-PDF engine integration.", COLOR_ACCENT_PURPLE)
    ]

    for idx, (title, desc, col) in enumerate(ui_highlights):
        ry = Inches(1.85) + idx * (rh + Inches(0.23))
        card = s10.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, rx, ry, rw, rh)
        card.fill.solid()
        card.fill.fore_color.rgb = COLOR_BG_WHITE
        card.line.color.rgb = COLOR_BORDER_PURPLE
        card.line.width = Pt(1.5)

        # Left color strip
        strip = s10.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, rx, ry, Inches(0.18), rh)
        strip.fill.solid()
        strip.fill.fore_color.rgb = col
        strip.line.fill.background()

        tbox = s10.shapes.add_textbox(rx + Inches(0.35), ry + Inches(0.15), rw - Inches(0.5), rh - Inches(0.3))
        tf = tbox.text_frame
        tf.word_wrap = True
        p1 = tf.paragraphs[0]
        p1.text = title
        p1.font.name = "Segoe UI"
        p1.font.size = Pt(12)
        p1.font.bold = True
        p1.font.color.rgb = COLOR_DARK_PURPLE

        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.name = "Segoe UI"
        p2.font.size = Pt(9.8)
        p2.font.color.rgb = COLOR_TEXT_MUTED


    # =========================================================================
    # SLIDE 11: RESOURCE MANAGEMENT & CURRICULUM (LIGHT THEME)
    # =========================================================================
    s11 = prs.slides.add_slide(blank_layout)
    set_slide_bg(s11)
    add_slide_header(s11, "Curriculum Resource Management & Subject Coverage", "SYLLABUS CONTENT")

    subj_w = Inches(2.7)
    subj_h = Inches(3.6)

    subjects = [
        ("C Programming", "Systems & Memory", [
            "Compilation Pipeline (GCC)",
            "Data Types & Format Specifiers",
            "Pointers & Address Operators",
            "Dynamic Memory (malloc, free)",
            "Runnable Swap Code Snippet"
        ], COLOR_ROYAL_VIOLET),
        ("Web Development", "Frontend Engineering", [
            "Semantic HTML5 Architecture",
            "CSS Box Model Mechanics",
            "1D Flexbox vs 2D CSS Grid",
            "Responsive Mobile Design",
            "Asynchronous JavaScript (Fetch)"
        ], COLOR_ACCENT_ORANGE),
        ("Cloud Computing", "Infrastructure & AWS", [
            "Cloud Models (IaaS, PaaS, SaaS)",
            "AWS Global Regions & AZs",
            "EC2, S3, RDS & Lambda Services",
            "IAM Roles & JSON Policies",
            "Cloud Security Best Practices"
        ], COLOR_ACCENT_PURPLE),
        ("Java & Python", "OOP & Data Science", [
            "4 Pillars of Object-Oriented Prog",
            "Java Collections (List, Set, Map)",
            "Exception Handling (try-catch)",
            "Python List Comprehensions",
            "Mutable vs Immutable Objects"
        ], COLOR_DARK_PURPLE)
    ]

    for idx, (title, sub, topics, col) in enumerate(subjects):
        sx = Inches(0.8) + idx * (subj_w + Inches(0.27))
        sy = Inches(1.85)

        card = s11.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, sx, sy, subj_w, subj_h)
        card.fill.solid()
        card.fill.fore_color.rgb = COLOR_BG_WHITE
        card.line.color.rgb = COLOR_BORDER_PURPLE
        card.line.width = Pt(1.5)

        # Header Pill
        hpill = s11.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, sx + Inches(0.15), sy + Inches(0.15), subj_w - Inches(0.3), Inches(0.6))
        hpill.fill.solid()
        hpill.fill.fore_color.rgb = col
        hpill.line.fill.background()
        tf_h = hpill.text_frame
        tf_h.vertical_anchor = MSO_ANCHOR.MIDDLE
        p1 = tf_h.paragraphs[0]
        p1.text = title
        p1.font.name = "Segoe UI"
        p1.font.size = Pt(12)
        p1.font.bold = True
        p1.font.color.rgb = COLOR_BG_WHITE
        p1.alignment = PP_ALIGN.CENTER
        p2 = tf_h.add_paragraph()
        p2.text = sub
        p2.font.name = "Segoe UI"
        p2.font.size = Pt(8.5)
        p2.font.color.rgb = COLOR_SOFT_PURPLE
        p2.alignment = PP_ALIGN.CENTER

        # Topics list
        tb = s11.shapes.add_textbox(sx + Inches(0.15), sy + Inches(0.85), subj_w - Inches(0.3), Inches(2.6))
        tf = tb.text_frame
        tf.word_wrap = True
        for t_idx, topic in enumerate(topics):
            p = tf.paragraphs[0] if t_idx == 0 else tf.add_paragraph()
            p.text = f"✓  {topic}"
            p.font.name = "Segoe UI"
            p.font.size = Pt(10)
            p.font.color.rgb = COLOR_TEXT_MUTED

    # Bottom Export Feature Banner
    exp_banner = s11.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(5.65), Inches(11.733), Inches(1.15))
    exp_banner.fill.solid()
    exp_banner.fill.fore_color.rgb = COLOR_SOFT_PURPLE
    exp_banner.line.color.rgb = COLOR_ACCENT_PURPLE
    exp_banner.line.width = Pt(1.5)

    tf_eb = exp_banner.text_frame
    tf_eb.word_wrap = True
    tf_eb.vertical_anchor = MSO_ANCHOR.MIDDLE
    tf_eb.margin_left = Inches(0.25)
    p_e1 = tf_eb.paragraphs[0]
    p_e1.text = "⚡ Built-in Academic Export Engine"
    p_e1.font.name = "Segoe UI"
    p_e1.font.size = Pt(12)
    p_e1.font.bold = True
    p_e1.font.color.rgb = COLOR_DARK_PURPLE
    p_e2 = tf_eb.add_paragraph()
    p_e2.text = "Students can download clean .txt study summaries via HTML5 Blob API, copy code directly to IDEs, or trigger browser window.print() with custom @media print rules to produce multipage PDF revision guides."
    p_e2.font.name = "Segoe UI"
    p_e2.font.size = Pt(10)
    p_e2.font.color.rgb = COLOR_TEXT_MUTED


    # =========================================================================
    # SLIDE 12: ADVANTAGES & IMPACT (LIGHT THEME)
    # =========================================================================
    s12 = prs.slides.add_slide(blank_layout)
    set_slide_bg(s12)
    add_slide_header(s12, "Key Advantages & Academic Impact", "STAKEHOLDER BENEFITS")

    adv_w = Inches(3.75)
    adv_h = Inches(4.95)

    advantages = [
        ("🎓", "For Students", COLOR_ROYAL_VIOLET, [
            ("Instant Knowledge Access", "Single-Page Application speed with zero page reloading delays."),
            ("Curriculum Alignment", "Notes directly tailored to semester examination patterns."),
            ("Active Code Practice", "One-click copyable snippets ready for immediate IDE testing."),
            ("Offline Revision", "Downloadable text files and print-to-PDF for exam hall preparation.")
        ]),
        ("👨‍🏫", "For Faculty & Guides", COLOR_ACCENT_ORANGE, [
            ("Eliminate Redundancy", "No more manually re-emailing lost study files to multiple student batches."),
            ("Quality Assurance", "Ensure the entire class studies from verified and updated references."),
            ("Moderation Control", "Administrative dashboard to inspect and approve student contributions."),
            ("Centralized Distribution", "A single definitive source for lecture summaries and lab exercises.")
        ]),
        ("🏛️", "For the Institution", COLOR_ACCENT_PURPLE, [
            ("Zero Cloud DB Costs", "Lightweight SQLite database minimizes recurring infrastructure overhead."),
            ("Academic Repository", "Builds a growing institutional knowledge base year after year."),
            ("Modern Web Standards", "Pure HTML5, CSS3, and ES6+ make the codebase simple to maintain."),
            ("Extensible Architecture", "Ready for future AI enhancements, quizzes, and university integration.")
        ])
    ]

    for idx, (icon, title, col, perks) in enumerate(advantages):
        ax = Inches(0.8) + idx * (adv_w + Inches(0.24))
        ay = Inches(1.85)

        card = s12.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, ax, ay, adv_w, adv_h)
        card.fill.solid()
        card.fill.fore_color.rgb = COLOR_BG_WHITE
        card.line.color.rgb = COLOR_BORDER_PURPLE
        card.line.width = Pt(1.5)

        # Header Pill
        hpill = s12.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, ax + Inches(0.15), ay + Inches(0.15), adv_w - Inches(0.3), Inches(0.55))
        hpill.fill.solid()
        hpill.fill.fore_color.rgb = col
        hpill.line.fill.background()
        tf_h = hpill.text_frame
        tf_h.vertical_anchor = MSO_ANCHOR.MIDDLE
        p_h = tf_h.paragraphs[0]
        p_h.text = f"{icon}  {title}"
        p_h.font.name = "Segoe UI"
        p_h.font.size = Pt(13)
        p_h.font.bold = True
        p_h.font.color.rgb = COLOR_BG_WHITE
        p_h.alignment = PP_ALIGN.CENTER

        for p_idx, (p_title, p_desc) in enumerate(perks):
            py = ay + Inches(0.85) + p_idx * Inches(0.98)
            pbox = s12.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, ax + Inches(0.15), py, adv_w - Inches(0.3), Inches(0.88))
            pbox.fill.solid()
            pbox.fill.fore_color.rgb = COLOR_SOFT_PURPLE
            pbox.line.color.rgb = COLOR_BORDER_PURPLE
            pbox.line.width = Pt(1)

            tf_p = pbox.text_frame
            tf_p.word_wrap = True
            tf_p.margin_left = Inches(0.15)
            tf_p.margin_right = Inches(0.15)
            p_t = tf_p.paragraphs[0]
            p_t.text = f"★  {p_title}"
            p_t.font.name = "Segoe UI"
            p_t.font.size = Pt(10.5)
            p_t.font.bold = True
            p_t.font.color.rgb = COLOR_DARK_PURPLE

            p_d = tf_p.add_paragraph()
            p_d.text = p_desc
            p_d.font.name = "Segoe UI"
            p_d.font.size = Pt(8.8)
            p_d.font.color.rgb = COLOR_TEXT_MUTED


    # =========================================================================
    # SLIDE 13: FUTURE ENHANCEMENTS (LIGHT THEME)
    # =========================================================================
    s13 = prs.slides.add_slide(blank_layout)
    set_slide_bg(s13)
    add_slide_header(s13, "Future Enhancements & Technological Roadmap", "FUTURE ROADMAP")

    fw = Inches(5.7)
    fh = Inches(2.35)

    enhancements = [
        ("🤖", "Conversational LLM AI Integration", 
         "Connect the AI Search module to external Large Language Model APIs (e.g., Google Gemini API or OpenAI) to support multi-turn conversational tutoring and automated exam question generation.",
         "PLANNED: PHASE 2", COLOR_ROYAL_VIOLET,
         "• Multi-turn doubt solving  • Auto-generated study quizzes  • Contextual syllabus hints"),
        ("☁️", "Scalable Cloud Storage (AWS S3)", 
         "Transition local server disk uploads (multer diskStorage) to cloud bucket storage (Amazon S3 / Cloudinary) to enable infinite study file uploads and seamless global CDN distribution.",
         "PLANNED: PHASE 2", COLOR_ACCENT_ORANGE,
         "• Amazon S3 bucket integration  • CloudFront CDN caching  • Instant PDF thumbnail preview"),
        ("⭐", "Peer Ratings & Discussion Threads", 
         "Enable community voting, usefulness ratings, and contextual discussion comments on notes so students can ask doubts and review quality collaboratively.",
         "PLANNED: PHASE 3", COLOR_ACCENT_PURPLE,
         "• 5-star student review system  • Threaded question comments  • Community-curated top notes"),
        ("🌓", "Adaptive Theme Switcher & Accessibility", 
         "Implement dynamic theme switching between the current signature dark mode and a crisp daylight mode, along with WCAG screen reader accessibility enhancements.",
         "PLANNED: PHASE 3", COLOR_DARK_PURPLE,
         "• Dark / Light theme toggle  • WCAG 2.1 AAA high-contrast  • Full keyboard navigation")
    ]

    for idx, (icon, title, desc, tag, col, sub_feat) in enumerate(enhancements):
        row = idx // 2
        col_idx = idx % 2
        fx = Inches(0.8) + col_idx * (fw + Inches(0.33))
        fy = Inches(1.85) + row * (fh + Inches(0.25))

        card = s13.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, fx, fy, fw, fh)
        card.fill.solid()
        card.fill.fore_color.rgb = COLOR_BG_WHITE
        card.line.color.rgb = COLOR_BORDER_PURPLE
        card.line.width = Pt(1.5)

        # Tag badge
        tb_tag = s13.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, fx + fw - Inches(1.8), fy + Inches(0.2), Inches(1.55), Inches(0.3))
        tb_tag.fill.solid()
        tb_tag.fill.fore_color.rgb = COLOR_SOFT_PURPLE
        tb_tag.line.color.rgb = col
        tb_tag.line.width = Pt(1)
        tf_tb = tb_tag.text_frame
        tf_tb.vertical_anchor = MSO_ANCHOR.MIDDLE
        p_tb = tf_tb.paragraphs[0]
        p_tb.text = tag
        p_tb.font.name = "Segoe UI"
        p_tb.font.size = Pt(8.5)
        p_tb.font.bold = True
        p_tb.font.color.rgb = col
        p_tb.alignment = PP_ALIGN.CENTER

        tbox = s13.shapes.add_textbox(fx + Inches(0.25), fy + Inches(0.18), fw - Inches(2.2), Inches(0.55))
        tf = tbox.text_frame
        tf.word_wrap = True
        p1 = tf.paragraphs[0]
        p1.text = f"{icon}  {title}"
        p1.font.name = "Segoe UI"
        p1.font.size = Pt(13)
        p1.font.bold = True
        p1.font.color.rgb = COLOR_DARK_PURPLE

        tbox2 = s13.shapes.add_textbox(fx + Inches(0.25), fy + Inches(0.75), fw - Inches(0.5), Inches(0.95))
        tf2 = tbox2.text_frame
        tf2.word_wrap = True
        p2 = tf2.paragraphs[0]
        p2.text = desc
        p2.font.name = "Segoe UI"
        p2.font.size = Pt(9.8)
        p2.font.color.rgb = COLOR_TEXT_MUTED

        sub_pill = s13.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, fx + Inches(0.25), fy + fh - Inches(0.48), fw - Inches(0.5), Inches(0.35))
        sub_pill.fill.solid()
        sub_pill.fill.fore_color.rgb = COLOR_SOFT_PURPLE
        sub_pill.line.color.rgb = COLOR_BORDER_PURPLE
        sub_pill.line.width = Pt(1)
        tf_sp = sub_pill.text_frame
        tf_sp.vertical_anchor = MSO_ANCHOR.MIDDLE
        tf_sp.margin_left = Inches(0.15)
        p_sp = tf_sp.paragraphs[0]
        p_sp.text = f"✨  {sub_feat}"
        p_sp.font.name = "Segoe UI"
        p_sp.font.size = Pt(8.8)
        p_sp.font.bold = True
        p_sp.font.color.rgb = col


    # =========================================================================
    # SLIDE 14: CONCLUSION (LIGHT THEME)
    # =========================================================================
    s14 = prs.slides.add_slide(blank_layout)
    set_slide_bg(s14)
    add_slide_header(s14, "Conclusion & Project Summary", "CONCLUSION")

    con_w = Inches(11.733)
    con_h = Inches(1.48)
    cx = Inches(0.8)

    conclusions = [
        ("🏆 Successful Problem Resolution", 
         "The Student Study Resource Portal successfully resolves the chronic challenge of scattered, unreliable academic materials by delivering a centralized, dependable learning repository with verified curriculum materials.",
         COLOR_ROYAL_VIOLET, "• Verified syllabus alignment across 5 core engineering disciplines  • Direct peer-to-peer contribution"),
        ("⚡ Architectural & Operational Simplicity", 
         "By combining semantic HTML5, modern CSS tokens, vanilla JavaScript, Express.js v5, and embedded SQLite, the portal delivers lightning-fast sub-millisecond response times with zero build overhead.",
         COLOR_ACCENT_ORANGE, "• Zero framework bloat  • Synchronous sub-millisecond SQLite queries  • 100% portable file database"),
        ("🌟 Significant Real-World Impact", 
         "With features like interactive code copying, instant text note generation, and clean multipage print-to-PDF export, the platform equips college students with the tools to excel in examinations and lab practicals.",
         COLOR_ACCENT_PURPLE, "• Faster exam revisions  • Active hands-on programming practice  • Clean offline PDF revision guides")
    ]

    for idx, (title, text, col, highlights) in enumerate(conclusions):
        cy = Inches(1.85) + idx * (con_h + Inches(0.24))

        card = s14.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, cx, cy, con_w, con_h)
        card.fill.solid()
        card.fill.fore_color.rgb = COLOR_BG_WHITE
        card.line.color.rgb = COLOR_BORDER_PURPLE
        card.line.width = Pt(1.5)

        pillar = s14.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, cx + Inches(0.15), cy + Inches(0.15), Inches(0.2), con_h - Inches(0.3))
        pillar.fill.solid()
        pillar.fill.fore_color.rgb = col
        pillar.line.fill.background()

        tb = s14.shapes.add_textbox(cx + Inches(0.55), cy + Inches(0.12), con_w - Inches(0.9), con_h - Inches(0.25))
        tf = tb.text_frame
        tf.word_wrap = True
        p1 = tf.paragraphs[0]
        p1.text = title
        p1.font.name = "Segoe UI"
        p1.font.size = Pt(13.5)
        p1.font.bold = True
        p1.font.color.rgb = COLOR_DARK_PURPLE

        p2 = tf.add_paragraph()
        p2.text = text
        p2.font.name = "Segoe UI"
        p2.font.size = Pt(10.2)
        p2.font.color.rgb = COLOR_TEXT_MUTED

        p3 = tf.add_paragraph()
        p3.text = highlights
        p3.font.name = "Segoe UI"
        p3.font.size = Pt(9.2)
        p3.font.bold = True
        p3.font.color.rgb = col


    # =========================================================================
    # SLIDE 15: STEP 3: FINAL THANK YOU SLIDE (CREATIVE GLOWING ART)
    # =========================================================================
    s15 = prs.slides.add_slide(blank_layout)

    bg_art = "presentation_assets/thankyou_bg_art.jpg"
    if os.path.exists(bg_art):
        s15.shapes.add_picture(bg_art, 0, 0, width=Inches(13.333), height=Inches(7.5))
    else:
        bg15 = s15.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg15.fill.solid()
        bg15.fill.fore_color.rgb = COLOR_DARK_PURPLE
        bg15.line.fill.background()

    card_thank = s15.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(2.2), Inches(1.3), Inches(8.933), Inches(4.9))
    card_thank.fill.solid()
    card_thank.fill.fore_color.rgb = RGBColor(0x1A, 0x0C, 0x30)
    card_thank.line.color.rgb = RGBColor(0xA7, 0x8B, 0xFA)
    card_thank.line.width = Pt(2)

    tb_thank = s15.shapes.add_textbox(Inches(2.5), Inches(1.6), Inches(8.333), Inches(1.3))
    tf_th = tb_thank.text_frame
    tf_th.word_wrap = True
    p_th = tf_th.paragraphs[0]
    p_th.text = "THANK YOU!"
    p_th.font.name = "Segoe UI"
    p_th.font.size = Pt(54)
    p_th.font.bold = True
    p_th.font.color.rgb = COLOR_BG_WHITE
    p_th.alignment = PP_ALIGN.CENTER

    p_th2 = tf_th.add_paragraph()
    p_th2.text = "Student Study Resource Portal"
    p_th2.font.name = "Segoe UI"
    p_th2.font.size = Pt(20)
    p_th2.font.bold = True
    p_th2.font.color.rgb = RGBColor(0xDD, 0xD6, 0xFE)
    p_th2.alignment = PP_ALIGN.CENTER

    qa_badge = s15.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(4.4), Inches(3.25), Inches(4.533), Inches(0.48))
    qa_badge.fill.solid()
    qa_badge.fill.fore_color.rgb = COLOR_ACCENT_ORANGE
    qa_badge.line.fill.background()
    tf_qa = qa_badge.text_frame
    tf_qa.vertical_anchor = MSO_ANCHOR.MIDDLE
    p_qa = tf_qa.paragraphs[0]
    p_qa.text = "💡 QUESTIONS & ANSWERS / PROJECT REVIEW"
    p_qa.font.name = "Segoe UI"
    p_qa.font.size = Pt(11)
    p_qa.font.bold = True
    p_qa.font.color.rgb = COLOR_BG_WHITE
    p_qa.alignment = PP_ALIGN.CENTER

    tb_foot = s15.shapes.add_textbox(Inches(2.5), Inches(3.95), Inches(8.333), Inches(1.9))
    tf_ft = tb_foot.text_frame
    tf_ft.word_wrap = True
    
    p_f1 = tf_ft.paragraphs[0]
    p_f1.text = "Presented by:"
    p_f1.font.name = "Segoe UI"
    p_f1.font.size = Pt(12)
    p_f1.font.color.rgb = RGBColor(0xC4, 0xB5, 0xFD)
    p_f1.alignment = PP_ALIGN.CENTER

    p_f2 = tf_ft.add_paragraph()
    p_f2.text = "S. Keerthana  •  G. Kirthimaha  •  K. Keerthana  •  R. Madhu Shri  •  S. Madhumita"
    p_f2.font.name = "Segoe UI"
    p_f2.font.size = Pt(13)
    p_f2.font.bold = True
    p_f2.font.color.rgb = COLOR_BG_WHITE
    p_f2.alignment = PP_ALIGN.CENTER

    p_f3 = tf_ft.add_paragraph()
    p_f3.text = "DEPARTMENT OF INFORMATION TECHNOLOGY"
    p_f3.font.name = "Segoe UI"
    p_f3.font.size = Pt(11.5)
    p_f3.font.bold = True
    p_f3.font.color.rgb = COLOR_ACCENT_ORANGE
    p_f3.alignment = PP_ALIGN.CENTER

    p_f4 = tf_ft.add_paragraph()
    p_f4.text = "ER. PERUMAL MANIMEKALAI COLLEGE OF ENGINEERING, HOSUR"
    p_f4.font.name = "Segoe UI"
    p_f4.font.size = Pt(11)
    p_f4.font.color.rgb = RGBColor(0xEE, 0xEA, 0xF9)
    p_f4.alignment = PP_ALIGN.CENTER

    # Save Presentation
    output_filename = "Student_Study_Resource_Portal.pptx"
    prs.save(output_filename)
    print(f"Presentation restored successfully: {output_filename}")

if __name__ == "__main__":
    create_presentation()
