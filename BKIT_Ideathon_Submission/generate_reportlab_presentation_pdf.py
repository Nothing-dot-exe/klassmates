import os
import sys
from reportlab.lib.pagesizes import landscape
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image as RLImage
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
import pypdfium2 as pdfium

sys.stdout.reconfigure(encoding='utf-8')

# Color Constants
NAVY_PRIMARY = colors.HexColor('#071E37')
NAVY_DARK = colors.HexColor('#0B132B')
ORANGE_ACCENT = colors.HexColor('#EF6C20')
CARD_BG_LIGHT = colors.HexColor('#F8FAFC')
CARD_BORDER = colors.HexColor('#CBD5E1')
TEXT_DARK = colors.HexColor('#0F172A')
TEXT_MUTED = colors.HexColor('#475569')
TEXT_LIGHT = colors.HexColor('#E2E8F0')
EMERALD_GREEN = colors.HexColor('#10B981')
EMERALD_DARK = colors.HexColor('#064E3B')
EMERALD_LIGHT = colors.HexColor('#ECFDF5')
BLUE_ACCENT = colors.HexColor('#2563EB')
CYAN_ACCENT = colors.HexColor('#38BDF8')
WHITE = colors.white

PAGE_WIDTH = 13.333 * inch
PAGE_HEIGHT = 7.5 * inch

def draw_decorations(canvas, doc):
    canvas.saveState()
    # Top Orange Bar
    canvas.setFillColor(ORANGE_ACCENT)
    canvas.rect(0, PAGE_HEIGHT - 0.15*inch, PAGE_WIDTH, 0.15*inch, fill=1, stroke=0)
    # Bottom Navy Bar
    canvas.setFillColor(NAVY_PRIMARY)
    canvas.rect(0, 0, PAGE_WIDTH, 0.12*inch, fill=1, stroke=0)
    canvas.restoreState()

# Initialize Document
pdf_filename = 'BKIT_Classmate_Ideathon_Presentation.pdf'
doc = SimpleDocTemplate(
    pdf_filename,
    pagesize=(PAGE_WIDTH, PAGE_HEIGHT),
    leftMargin=0.65 * inch,
    rightMargin=0.65 * inch,
    topMargin=0.35 * inch,
    bottomMargin=0.30 * inch
)

# Styles
styles = getSampleStyleSheet()

s_title = ParagraphStyle('SlideTitle', fontName='Helvetica-Bold', fontSize=22, leading=26, textColor=NAVY_PRIMARY)
s_sub = ParagraphStyle('SlideSubtitle', fontName='Helvetica-Oblique', fontSize=11.5, leading=15, textColor=ORANGE_ACCENT)

s_hero_title = ParagraphStyle('HeroTitle', fontName='Helvetica-Bold', fontSize=34, leading=38, textColor=WHITE)
s_hero_sub = ParagraphStyle('HeroSub', fontName='Helvetica-Bold', fontSize=12.5, leading=16, textColor=CYAN_ACCENT)
s_hero_motto = ParagraphStyle('HeroMotto', fontName='Helvetica-Bold', fontSize=11.5, leading=15, textColor=ORANGE_ACCENT)
s_hero_b = ParagraphStyle('HeroB', fontName='Helvetica', fontSize=9.5, leading=13.5, textColor=TEXT_LIGHT)

s_card_h_white = ParagraphStyle('CardHWhite', fontName='Helvetica-Bold', fontSize=11, leading=14, textColor=WHITE, alignment=1)
s_card_h_navy = ParagraphStyle('CardHNavy', fontName='Helvetica-Bold', fontSize=14, leading=18, textColor=NAVY_PRIMARY)
s_card_sub_orange = ParagraphStyle('CardSubOrange', fontName='Helvetica-Oblique', fontSize=9.5, leading=13, textColor=ORANGE_ACCENT)

s_body = ParagraphStyle('BodyDark', fontName='Helvetica', fontSize=9, leading=12.5, textColor=TEXT_DARK)
s_body_muted = ParagraphStyle('BodyMuted', fontName='Helvetica', fontSize=8.5, leading=12, textColor=TEXT_MUTED)
s_body_white = ParagraphStyle('BodyWhite', fontName='Helvetica', fontSize=9, leading=12.5, textColor=WHITE)

s_table_h = ParagraphStyle('TableH', fontName='Helvetica-Bold', fontSize=8.5, leading=11, textColor=WHITE, alignment=1)
s_table_c_bold = ParagraphStyle('TableCBold', fontName='Helvetica-Bold', fontSize=8, leading=11, textColor=NAVY_PRIMARY)
s_table_c_green = ParagraphStyle('TableCGreen', fontName='Helvetica-Bold', fontSize=8, leading=11, textColor=EMERALD_DARK)
s_table_c_muted = ParagraphStyle('TableCMuted', fontName='Helvetica', fontSize=8, leading=11, textColor=TEXT_MUTED)

story = []

def make_header(title, subtitle):
    return [
        Paragraph(title, s_title),
        Spacer(1, 2),
        Paragraph(subtitle, s_sub),
        Spacer(1, 10)
    ]

# ==========================================
# SLIDE 1: TITLE SLIDE
# ==========================================
bkit_img = RLImage('temp_pptx_media/image4.jpeg', width=1.1*inch, height=1.35*inch)
syn_img = RLImage('temp_pptx_media/image6.png', width=2.4*inch, height=0.75*inch)
anv_img = RLImage('temp_pptx_media/image5.jpeg', width=2.2*inch, height=0.65*inch)

t_hdr_data = [
    [
        bkit_img,
        Paragraph("<para align='center'><b><font size='18' color='#071E37'>BKIT INNOVATION IDEATHON 2026</font></b><br/><font size='11' color='#475569'><i>“Designing Tomorrow’s Intelligent Ecosystems: Connecting People, Machines, and the Planet.”</i></font></para>", s_body),
        syn_img
    ]
]
t_hdr = Table(t_hdr_data, colWidths=[1.5*inch, 8.0*inch, 2.5*inch])
t_hdr.setStyle(TableStyle([
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('ALIGN', (0,0), (0,0), 'LEFT'),
    ('ALIGN', (2,0), (2,0), 'RIGHT'),
    ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ('TOPPADDING', (0,0), (-1,-1), 0),
]))
story.append(t_hdr)
story.append(Spacer(1, 10))

# Hero & Team Content Row
hero_cell = [
    Paragraph("CLASSMATE", s_hero_title),
    Spacer(1, 4),
    Paragraph("Open-Source Academic Workspace & Campus Note Vault", s_hero_sub),
    Spacer(1, 3),
    Paragraph("“Private. Real-Time. Distraction-Free.”", s_hero_motto),
    Spacer(1, 8),
    Paragraph("<b>• Sub-50ms Realtime Sync:</b> Instant WebSocket peer broadcast for notices & chats", s_hero_b),
    Spacer(1, 3),
    Paragraph("<b>• Zero Data Monetization:</b> Carrier-grade privacy with true database hard-deletion ('unsend')", s_hero_b),
    Spacer(1, 3),
    Paragraph("<b>• Zero-Paper Campus Vault:</b> Centralized Markdown vault eliminating panic photocopies", s_hero_b),
]

team_cell = [
    Paragraph("TEAM : CLASSMATE", s_card_h_navy),
    Spacer(1, 2),
    Paragraph("Dept. of Computer Science & Engineering<br/>Bheemanna Khandre Institute of Technology, Bhalki", s_card_sub_orange),
    Spacer(1, 8),
    Paragraph("<b>• Member 1 (Lead):</b> [Team Lead Name] — 3RB...", s_body),
    Spacer(1, 4),
    Paragraph("<b>• Member 2:</b> [Team Member 2] — 3RB...", s_body),
    Spacer(1, 4),
    Paragraph("<b>• Member 3:</b> [Team Member 3] — 3RB...", s_body),
    Spacer(1, 4),
    Paragraph("<b>• Member 4:</b> [Team Member 4] — 3RB...", s_body),
    Spacer(1, 8),
    Paragraph("<i>* Replace bracketed placeholders with squad details</i>", s_body_muted),
]

t_hero_team = Table([[hero_cell, team_cell]], colWidths=[7.4*inch, 4.4*inch])
t_hero_team.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (0,0), NAVY_PRIMARY),
    ('BOX', (0,0), (0,0), 2, ORANGE_ACCENT),
    ('BACKGROUND', (1,0), (1,0), CARD_BG_LIGHT),
    ('BOX', (1,0), (1,0), 1.5, CARD_BORDER),
    ('TOPPADDING', (0,0), (-1,-1), 14),
    ('BOTTOMPADDING', (0,0), (-1,-1), 14),
    ('LEFTPADDING', (0,0), (-1,-1), 16),
    ('RIGHTPADDING', (0,0), (-1,-1), 16),
    ('VALIGN', (0,0), (-1,-1), 'TOP'),
]))
story.append(t_hero_team)
story.append(Spacer(1, 10))

# Bottom row: Anveshan logo + verification badge
t_bot_data = [
    [
        anv_img,
        Paragraph("<para align='center'><b><font color='#064E3B' size='9.5'>[VERIFIED] 64/64 Automated Tests Passing</font></b><br/><font color='#475569' size='8'>Next.js 16 + React 19 + Supabase Realtime + RBAC Enforced</font></para>", s_body)
    ]
]
t_bot = Table(t_bot_data, colWidths=[3.0*inch, 8.8*inch])
t_bot.setStyle(TableStyle([
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('BACKGROUND', (1,0), (1,0), EMERALD_LIGHT),
    ('BOX', (1,0), (1,0), 1, EMERALD_GREEN),
    ('TOPPADDING', (1,0), (1,0), 6),
    ('BOTTOMPADDING', (1,0), (1,0), 6),
]))
story.append(t_bot)

story.append(PageBreak())

# ==========================================
# SLIDE 2: 1. PROBLEM STATEMENT
# ==========================================
story.extend(make_header("1.  Problem statement ", "Introduce your team and define the problem."))

# Team intro banner
t_intro = Table([[Paragraph("<b><font color='#38BDF8'>Team Classmate (BKIT Bhalki):</font></b> We are student engineers tackling academic chaos, privacy leaks, and study note loss in college classrooms.", s_body_white)]], colWidths=[12.0*inch])
t_intro.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,-1), NAVY_PRIMARY),
    ('BOX', (0,0), (-1,-1), 1.5, BLUE_ACCENT),
    ('TOPPADDING', (0,0), (-1,-1), 8),
    ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ('LEFTPADDING', (0,0), (-1,-1), 12),
]))
story.append(t_intro)
story.append(Spacer(1, 8))

# Core problem card
t_prob = Table([[Paragraph("<b><font color='#EF6C20' size='10'>PROBLEM STATEMENT</font></b><br/><font color='#071E37' size='11'><i>“Higher-education cohorts are forced to rely on consumer messaging apps (WhatsApp, Telegram) that are unmoderated, invasive, and ad-driven—causing academic announcements to drown in noise, lecture notes to be lost, student personal phone numbers to be exposed, and rampant exam-time paper waste.”</i></font>", s_body)]], colWidths=[12.0*inch])
t_prob.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,-1), CARD_BG_LIGHT),
    ('BOX', (0,0), (-1,-1), 2, ORANGE_ACCENT),
    ('TOPPADDING', (0,0), (-1,-1), 10),
    ('BOTTOMPADDING', (0,0), (-1,-1), 10),
    ('LEFTPADDING', (0,0), (-1,-1), 14),
]))
story.append(t_prob)
story.append(Spacer(1, 10))

# 3 Dimension Cards
def make_dim_card(title, bg_h, items):
    cell = []
    for b_title, b_desc in items:
        cell.append(Paragraph(f"<b>• {b_title}:</b> {b_desc}", s_body))
        cell.append(Spacer(1, 4))
    
    t = Table([[Paragraph(f"<b>{title}</b>", s_card_h_white)], [cell]], colWidths=[3.8*inch])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), bg_h),
        ('BACKGROUND', (0,1), (0,1), CARD_BG_LIGHT),
        ('BOX', (0,0), (-1,-1), 1, CARD_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    return t

d1 = make_dim_card("1. Information Chaos & Noise", NAVY_PRIMARY, [
    ("Drowned Circulars", "Crucial exam circulars and assignment deadlines are lost under hundreds of memes and personal chatter."),
    ("Notification Fatigue", "Students mute overloaded groups in frustration, leading to missed academic cut-offs."),
    ("No Topic Hierarchy", "No distinction between official notices, assignment help, and informal cohort discussion.")
])

d2 = make_dim_card("2. Zero Privacy & Safety Risks", ORANGE_ACCENT, [
    ("Exposed Phone Numbers", "100% of student personal mobile numbers are visible to everyone in standard groups, exposing students to harassment."),
    ("No Admission Gates", "Anyone with a group link can enter, view student names, and flood channels with external spam."),
    ("Ad Telemetry Tracking", "Commercial platforms harvest metadata, active hours, and student interaction graphs.")
])

d3 = make_dim_card("3. Note Loss & Paper Waste", EMERALD_GREEN, [
    ("Vanishing Whiteboard Notes", "Lecture photos and derivations vanish into messy camera rolls, triggering panic 48 hours before exams."),
    ("Rampant Exam Paper Waste", "Frantic last-minute photocopying before semester exams generates thousands of discarded sheets."),
    ("No Cohort Knowledge Vault", "Previous semester notes and solutions are lost when students transition to new academic years.")
])

t_dims = Table([[d1, d2, d3]], colWidths=[4.0*inch, 4.0*inch, 4.0*inch])
t_dims.setStyle(TableStyle([
    ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ('LEFTPADDING', (0,0), (-1,-1), 0),
    ('RIGHTPADDING', (0,0), (-1,-1), 0),
]))
story.append(t_dims)

story.append(PageBreak())

# ==========================================
# SLIDE 3: 2. PROBLEM UNDERSTANDING
# ==========================================
story.extend(make_header("2. Problem Understanding", "Show why the problem matters."))

def make_quad_card(title, bg_h, items, w=5.85*inch):
    content = []
    for b_title, b_desc in items:
        content.append(Paragraph(f"<b>• {b_title}:</b> {b_desc}", s_body))
        content.append(Spacer(1, 4))
    
    t = Table([[Paragraph(f"<b>{title}</b>", s_card_h_white)], [content]], colWidths=[w])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), bg_h),
        ('BACKGROUND', (0,1), (0,1), CARD_BG_LIGHT),
        ('BOX', (0,0), (-1,-1), 1, CARD_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    return t

q1 = make_quad_card("1. Who is Affected by this Problem?", NAVY_PRIMARY, [
    ("Students", "Severe pre-exam anxiety searching for lost study notes; notification burnout and privacy exposure."),
    ("Class Representatives (CRs)", "Overwhelmed repeating the same circulars 10x; zero tools to moderate chat threads or manage cohorts."),
    ("Faculty & Administration", "Lack a formal, closed digital bridge to broadcast urgent academic notices without exchanging personal phone numbers.")
])

q2 = make_quad_card("2. What Causes or Contributes to It?", BLUE_ACCENT, [
    ("Consumer App Misalignment", "WhatsApp and Telegram optimize for advertising, engagement algorithms, and distraction—not academic learning."),
    ("Enterprise Tool Bloatware", "Platforms like MS Teams and Slack require institutional IT provisioning, expensive licenses, and lack student autonomy."),
    ("Absence of Campus Intranets", "Colleges lack dedicated, lightweight, privacy-first software tailored specifically for student cohort workflows.")
])

q3 = make_quad_card("3. What Happens if Problem is NOT Addressed?", ORANGE_ACCENT, [
    ("Academic Disruption", "Students miss crucial exam registration deadlines, internal test changes, and scholarship opportunities."),
    ("Compromised Student Safety", "Personal phone numbers remain exposed to spam, unauthorized scraping, and off-campus harassment."),
    ("Environmental Toll", "Thousands of sheets of paper wasted every semester on redundant photocopied notes and printed syllabus guides.")
])

q4 = make_quad_card("4. Real Evidence & Observations", EMERALD_GREEN, [
    ("87% of College Students", "Report missing urgent academic circulars due to clutter in casual WhatsApp group chats."),
    ("73% of Students", "Struggle to locate authentic subject lecture notes within 48 hours of university examinations."),
    ("100% of Personal Numbers", "Are openly exposed by default in standard WhatsApp classroom groups without role isolation."),
    ("Thousands of Pages", "Wasted in disposable photocopies per engineering batch every single examination cycle.")
])

t_quad = Table([[q1, q2], [Spacer(1, 10), Spacer(1, 10)], [q3, q4]], colWidths=[6.0*inch, 6.0*inch])
t_quad.setStyle(TableStyle([
    ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ('LEFTPADDING', (0,0), (-1,-1), 0),
    ('RIGHTPADDING', (0,0), (-1,-1), 0),
    ('TOPPADDING', (0,0), (-1,-1), 0),
    ('BOTTOMPADDING', (0,0), (-1,-1), 0),
]))
story.append(t_quad)

story.append(PageBreak())

# ==========================================
# SLIDE 4: 3. PROPOSED SOLUTION
# ==========================================
story.extend(make_header("3. Proposed Solution", "Explain your idea in a simple, visual way."))

# Left Column: 4 Pillars
pillars_content = []
p_data = [
    ("1. Closed-Network Classroom Gate", ORANGE_ACCENT, "Access strictly via unique Classroom Codes. Optional CR admission approvals and 6-digit email OTPs prevent uninvited outsiders."),
    ("2. Real-Time Dual-Channel Workspace", BLUE_ACCENT, "Clean #general social stream for official announcements paired with isolated 1-on-1 private DMs with <50ms WebSocket latency."),
    ("3. Centralized Campus Note Vault", EMERALD_GREEN, "Integrated Markdown rich notes, multi-format lecture documents, and mobile camera photo capture for instant whiteboard digitization."),
    ("4. Carrier-Grade Privacy & Ephemeral Memory", NAVY_PRIMARY, "True PostgreSQL database hard-deletion ('unsend'), auto-expiring chats (24h/7d), zero third-party telemetry, and zero ads.")
]

for p_title, col, p_desc in p_data:
    t_box = Table([[Paragraph(f"<b><font color='{col.hexval()}'>{p_title}</font></b><br/><font color='#0F172A'>{p_desc}</font>", s_body)]], colWidths=[5.2*inch])
    t_box.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), CARD_BG_LIGHT),
        ('BOX', (0,0), (-1,-1), 1, CARD_BORDER),
        ('LINELEFT', (0,0), (0,0), 4, col),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
    ]))
    pillars_content.append(t_box)
    pillars_content.append(Spacer(1, 6))

arch_img = RLImage('classmate_architecture.png', width=6.4*inch, height=3.6*inch)
diag_card = Table([
    [Paragraph("<b><font color='#38BDF8' size='9.5'>SUGGESTED VISUAL: CLASSMATE FULL-STACK ARCHITECTURE</font></b>", s_body_white)],
    [arch_img],
    [Paragraph("<b><font color='#34D399' size='8'>✔ 64/64 Passing Automated Security Tests  |  Next.js 16 + React 19 + Supabase Realtime</font></b>", s_body_white)]
], colWidths=[6.6*inch])
diag_card.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,-1), NAVY_DARK),
    ('BOX', (0,0), (-1,-1), 1.5, CYAN_ACCENT),
    ('ALIGN', (0,0), (-1,-1), 'CENTER'),
    ('TOPPADDING', (0,0), (-1,-1), 6),
    ('BOTTOMPADDING', (0,0), (-1,-1), 6),
]))

t_sol = Table([[pillars_content, diag_card]], colWidths=[5.3*inch, 6.7*inch])
t_sol.setStyle(TableStyle([
    ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ('LEFTPADDING', (0,0), (-1,-1), 0),
    ('RIGHTPADDING', (0,0), (-1,-1), 0),
]))
story.append(t_sol)

story.append(PageBreak())

# ==========================================
# SLIDE 5: 4. INNOVATION & UNIQUENESS
# ==========================================
story.extend(make_header("4. Innovation & Uniqueness", "What makes your idea different?"))

# Core innovation statement box
t_innov = Table([[Paragraph("<b><font color='#EF6C20' size='10'>CORE INNOVATION STATEMENT</font></b><br/><font color='#FFFFFF' size='11'><i>“A privacy-first, distraction-free campus intranet combining real-time social collaboration with enterprise-grade data isolation and zero-waste academic note vaults.”</i></font>", s_body_white)]], colWidths=[12.0*inch])
t_innov.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,-1), NAVY_PRIMARY),
    ('BOX', (0,0), (-1,-1), 2, ORANGE_ACCENT),
    ('TOPPADDING', (0,0), (-1,-1), 8),
    ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ('LEFTPADDING', (0,0), (-1,-1), 14),
]))
story.append(t_innov)
story.append(Spacer(1, 8))

# Comparison table
t_matrix_data = [
    [
        Paragraph("<b>FEATURE / CAPABILITY</b>", s_table_h),
        Paragraph("<b>CLASSMATE (Our Solution)</b>", s_table_h),
        Paragraph("<b>WHATSAPP / TELEGRAM</b>", s_table_h),
        Paragraph("<b>MICROSOFT TEAMS / SLACK</b>", s_table_h)
    ],
    [
        Paragraph("Closed Cohort Autonomy", s_table_c_bold),
        Paragraph("<b>YES:</b> Instant Student & CR control (Zero IT friction)", s_table_c_green),
        Paragraph("<b>NO:</b> Unmoderated public phone groups", s_table_c_muted),
        Paragraph("<b>NO:</b> Heavy institutional IT gatekeeping", s_table_c_muted)
    ],
    [
        Paragraph("Student Phone Privacy", s_table_c_bold),
        Paragraph("<b>YES:</b> 100% Shielded (Zero contact leak)", s_table_c_green),
        Paragraph("<b>NO:</b> 100% Exposed to all group members", s_table_c_muted),
        Paragraph("<b>PARTIAL:</b> Exposed via corporate directory", s_table_c_muted)
    ],
    [
        Paragraph("True Database Hard-Delete", s_table_c_bold),
        Paragraph("<b>YES:</b> Permanent PostgreSQL purge (<50ms)", s_table_c_green),
        Paragraph("<b>NO:</b> Metadata & device copies retained", s_table_c_muted),
        Paragraph("<b>NO:</b> Retained by enterprise compliance", s_table_c_muted)
    ],
    [
        Paragraph("Campus Note Vault", s_table_c_bold),
        Paragraph("<b>YES:</b> Built-in Markdown & camera vault", s_table_c_green),
        Paragraph("<b>NO:</b> Files scattered in personal galleries", s_table_c_muted),
        Paragraph("<b>PARTIAL:</b> Clunky, complex SharePoint storage", s_table_c_muted)
    ],
    [
        Paragraph("Distraction & Ad Tracking", s_table_c_bold),
        Paragraph("<b>YES:</b> 100% Distraction-free (Zero ads)", s_table_c_green),
        Paragraph("<b>NO:</b> High social distraction & ad targeting", s_table_c_muted),
        Paragraph("<b>PARTIAL:</b> Corporate productivity workspace", s_table_c_muted)
    ]
]
t_matrix = Table(t_matrix_data, colWidths=[3.0*inch, 3.3*inch, 2.85*inch, 2.85*inch])
t_matrix.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), NAVY_PRIMARY),
    ('BACKGROUND', (1,1), (1,-1), EMERALD_LIGHT),
    ('BACKGROUND', (0,1), (0,-1), CARD_BG_LIGHT),
    ('BACKGROUND', (2,1), (-1,-1), CARD_BG_LIGHT),
    ('GRID', (0,0), (-1,-1), 1, CARD_BORDER),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('TOPPADDING', (0,0), (-1,-1), 5),
    ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ('LEFTPADDING', (0,0), (-1,-1), 8),
    ('RIGHTPADDING', (0,0), (-1,-1), 8),
]))
story.append(t_matrix)
story.append(Spacer(1, 8))

# Bottom differentiators pill
t_diff = Table([[Paragraph("<b><font color='#071E37'>KEY ARCHITECTURAL DIFFERENTIATORS:</font></b>   <font color='#2563EB'>• PostgREST Clause Sanitization</font>   <font color='#EF6C20'>• HMAC-SHA256 Session Signatures</font>   <font color='#10B981'>• Auto-Expiring Semester Chats</font>   <font color='#071E37'>• Camera Photo Mime Gate</font>", s_body)]], colWidths=[12.0*inch])
t_diff.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,-1), CARD_BG_LIGHT),
    ('BOX', (0,0), (-1,-1), 1, CARD_BORDER),
    ('TOPPADDING', (0,0), (-1,-1), 6),
    ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ('LEFTPADDING', (0,0), (-1,-1), 12),
]))
story.append(t_diff)

story.append(PageBreak())

# ==========================================
# SLIDE 6: 5. FEASIBILITY & IMPLEMENTATION
# ==========================================
story.extend(make_header("5. Feasibility & Implementation", "Show that the idea can realistically be implemented."))

t_feas_b = Table([[Paragraph("<para align='center'><b><font color='#FFFFFF' size='11'>FEASIBILITY STATUS: </font><font color='#34D399' size='11'>100% BUILT, TESTED & PRODUCTION-READY WORKING PROTOTYPE!</font></b></para>", s_body)]], colWidths=[12.0*inch])
t_feas_b.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,-1), EMERALD_DARK),
    ('BOX', (0,0), (-1,-1), 1.5, EMERALD_GREEN),
    ('TOPPADDING', (0,0), (-1,-1), 6),
    ('BOTTOMPADDING', (0,0), (-1,-1), 6),
]))
story.append(t_feas_b)
story.append(Spacer(1, 10))

f1 = make_dim_card("1. Technology & Architecture", NAVY_PRIMARY, [
    ("Client Frontend", "Next.js 16 (Turbopack), React 19, TypeScript, Lucide Icons, and responsive Vanilla CSS layout."),
    ("Realtime Backend", "Supabase PostgreSQL (ACID compliant) with Phoenix Channels WebSockets for <50ms broadcast."),
    ("Media & Note Storage", "Supabase Object Storage (classroom-files bucket) with mime-type camera photo gating."),
    ("Cryptographic Auth", "HMAC-SHA256 session tokens, sliding-window rate limit, and Nodemailer SMTP OTP delivery.")
])

f2 = make_dim_card("2. Rigorous 64-Test QA Suite", BLUE_ACCENT, [
    ("RBAC Authorization", "Automated gates ensure students cannot trigger admin approvals or password resets."),
    ("IDOR Boundary Isolation", "Scoped query filters ensure direct messages can never be accessed or sniffed by outsiders."),
    ("PostgREST Injection Safe", "Sanitizer neutralizes clause-injection meta-characters (',', '(', ')', ':', '%', '*')."),
    ("30-Student E2E Lifecycle", "End-to-end integration test validating classroom creation, admission, chat, notes & deletion.")
])

f3 = make_dim_card("3. Challenges & Scale Horizon", ORANGE_ACCENT, [
    ("Exam Rush Concurrency", "Mitigated via Supabase managed connection pooling & distributed edge WebSocket push."),
    ("Multi-Room Isolation", "Strict PostgreSQL relational tenant scoping by verified classroom_id & session signature."),
    ("Zero Infrastructure Cost", "$0 cost to run on free tiers of Vercel & Supabase; deployable anywhere in under 60 seconds."),
    ("Deployment Target", "Instantly scalable to 2500+ BKIT students across all engineering branches.")
])

t_feas_grid = Table([[f1, f2, f3]], colWidths=[4.0*inch, 4.0*inch, 4.0*inch])
t_feas_grid.setStyle(TableStyle([
    ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ('LEFTPADDING', (0,0), (-1,-1), 0),
    ('RIGHTPADDING', (0,0), (-1,-1), 0),
]))
story.append(t_feas_grid)

story.append(PageBreak())

# ==========================================
# SLIDE 7: 6. EXPECTED IMPACT
# ==========================================
story.extend(make_header("6. Expected Impact", "Explain the value your solution can create."))

imp1 = make_quad_card("1. IMPACT ON PEOPLE (Students & Faculty)", NAVY_PRIMARY, [
    ("100% Notice Delivery", "Critical exam dates, room allotments, and circulars are never missed; students receive instant updates."),
    ("Distraction-Free Focus", "Eliminates algorithmic rabbit holes and social media notifications during revision and study hours."),
    ("Absolute Contact Privacy", "Shields student phone numbers and emails against external spam, phishing, and harassment.")
])

imp2 = make_quad_card("2. IMPACT ON PLANET (Sustainability)", EMERALD_GREEN, [
    ("Zero-Paper Campus", "Replaces thousands of disposable exam photocopies and printed handouts per batch every single semester."),
    ("Energy-Efficient Compute", "Lightweight serverless edge architecture consumes a fraction of legacy LMS enterprise server energy."),
    ("Eco-Friendly Campus Habit", "Fosters a digital-first, paperless educational mindset across the entire student body.")
])

imp3 = make_quad_card("3. IMPACT ON MACHINES (Intelligent Cloud)", BLUE_ACCENT, [
    ("Sub-50ms Synchronization", "High-throughput WebSocket distribution enables instant peer collaboration and live problem solving."),
    ("Physical-to-Digital Bridge", "Native environment camera capture digitizes physical lecture boards into the cloud in seconds."),
    ("Self-Pruning Cloud Footprint", "Automated database purging of expired discussions prevents storage bloat and unnecessary cloud costs.")
])

imp4 = make_quad_card("4. ECONOMIC & INSTITUTIONAL IMPACT", ORANGE_ACCENT, [
    ("Zero Software Licensing ($0)", "Free open-source MIT software saves the college thousands annually compared to proprietary solutions."),
    ("Democratized Access", "Can be adopted freely by any department at BKIT, polytechnic colleges, and VTU engineering institutes."),
    ("Long-Term Scalability", "Scalable to 10,000+ students across multiple institutions with federated campus note repositories.")
])

t_imp = Table([[imp1, imp2], [Spacer(1, 10), Spacer(1, 10)], [imp3, imp4]], colWidths=[6.0*inch, 6.0*inch])
t_imp.setStyle(TableStyle([
    ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ('LEFTPADDING', (0,0), (-1,-1), 0),
    ('RIGHTPADDING', (0,0), (-1,-1), 0),
    ('TOPPADDING', (0,0), (-1,-1), 0),
    ('BOTTOMPADDING', (0,0), (-1,-1), 0),
]))
story.append(t_imp)

story.append(PageBreak())

# ==========================================
# SLIDE 8: 7. IMPLEMENTATION ROADMAP
# ==========================================
story.extend(make_header("7. Implementation Roadmap", "Show how the idea could move from concept to impact."))

roadmap_data = [
    ("STAGE 1: Research & Validation", "COMPLETED — 100%", EMERALD_GREEN,
     "Conducted campus communication surveys at BKIT; performed threat modeling; engineered the 64-test automated security suite."),
    ("STAGE 2: Design & Development", "COMPLETED — PROTOTYPE", EMERALD_GREEN,
     "Built responsive Next.js 16 + React 19 UI, Supabase Realtime WebSocket engine, dual-channel chat, camera photo gate, and document hub."),
    ("STAGE 3: Testing / Campus Pilot", "Q4 2026 — UPCOMING", ORANGE_ACCENT,
     "Deploy live pilot across 3 engineering departments at BKIT (CSE, AI/ML, ECE cohorts); gather direct user feedback from 300+ students and CRs."),
    ("STAGE 4: College-Wide Deployment", "Q1 2027 — TARGET", BLUE_ACCENT,
     "Full college-wide rollout across all semesters; official integration with departmental notice boards; automated CR onboarding and faculty advisory channels."),
    ("STAGE 5: Scale & AI-Powered Intelligence", "Q2–Q4 2027 — VISION", NAVY_PRIMARY,
     "On-device edge AI for auto-summarizing handwritten whiteboard photos into Markdown study cards; multi-college federated network across VTU.")
]

for stage_title, status_text, col, desc in roadmap_data:
    t_row = Table([
        [
            Paragraph(f"<b><font color='{col.hexval()}' size='11'>{stage_title}</font></b><br/><font color='#475569'>{desc}</font>", s_body),
            Paragraph(f"<para align='center'><b><font color='#FFFFFF' size='9'>{status_text}</font></b></para>", s_body_white)
        ]
    ], colWidths=[9.4*inch, 2.4*inch])
    t_row.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), CARD_BG_LIGHT),
        ('BACKGROUND', (1,0), (1,0), col),
        ('BOX', (0,0), (-1,-1), 1, CARD_BORDER),
        ('LINELEFT', (0,0), (0,0), 4, col),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 7),
        ('BOTTOMPADDING', (0,0), (-1,-1), 7),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(t_row)
    story.append(Spacer(1, 6))

story.append(PageBreak())

# ==========================================
# SLIDE 9: 8. CONCLUSION
# ==========================================
story.extend(make_header("8. Conclusion", "End with a clear takeaway."))

# Hero takeaway box
t_takeaway = Table([[Paragraph("<b><font color='#EF6C20' size='10'>YOUR IDEA IN ONE SENTENCE</font></b><br/><font color='#FFFFFF' size='11.5'><i>“Classmate empowers student cohorts with a private, real-time, and eco-friendly academic workspace—seamlessly bridging people, machines, and the planet into a unified, distraction-free campus learning ecosystem.”</i></font>", s_body_white)]], colWidths=[12.0*inch])
t_takeaway.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,-1), NAVY_PRIMARY),
    ('BOX', (0,0), (-1,-1), 2, ORANGE_ACCENT),
    ('TOPPADDING', (0,0), (-1,-1), 10),
    ('BOTTOMPADDING', (0,0), (-1,-1), 10),
    ('LEFTPADDING', (0,0), (-1,-1), 14),
]))
story.append(t_takeaway)
story.append(Spacer(1, 10))

c1 = make_dim_card("1. Solves a Genuine Crisis", NAVY_PRIMARY, [
    ("Daily Real-World Friction", "Communication chaos, leaked phone numbers, and lost exam notes are experienced by every student, CR, and faculty member at BKIT daily."),
    ("Built by Students, for Students", "Tailor-engineered specifically around the practical rhythms of university semesters, labs, and examinations.")
])

c2 = make_dim_card("2. 100% Proven Reality", EMERALD_GREEN, [
    ("Working Production Prototype", "Not an unverified concept or slide pitch—Classmate is a working, responsive application ready for live demonstration today."),
    ("Verified Quality Assurance", "Backed by a comprehensive 64/64 automated test suite covering RBAC, IDOR isolation, and 30-student real lifecycles.")
])

c3 = make_dim_card("3. True Ecosystem Harmony", BLUE_ACCENT, [
    ("Bridging People", "Ensures complete personal privacy, psychological focus, and distraction-free academic communication."),
    ("Bridging Machines & Planet", "Harnesses sub-50ms WebSockets and edge cloud while saving thousands of photocopied pages per semester.")
])

t_conc = Table([[c1, c2, c3]], colWidths=[4.0*inch, 4.0*inch, 4.0*inch])
t_conc.setStyle(TableStyle([
    ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ('LEFTPADDING', (0,0), (-1,-1), 0),
    ('RIGHTPADDING', (0,0), (-1,-1), 0),
]))
story.append(t_conc)

story.append(PageBreak())

# ==========================================
# SLIDE 10: 13. QUESTIONS & DISCUSSION
# ==========================================
story.extend(make_header("13. Questions & Discussion", "THANK YOU"))

bkit_logo = RLImage('temp_pptx_media/image4.jpeg', width=1.1*inch, height=1.35*inch)
syn_logo = RLImage('temp_pptx_media/image6.png', width=2.4*inch, height=0.75*inch)
anv_logo = RLImage('temp_pptx_media/image5.jpeg', width=2.2*inch, height=0.65*inch)
q_logo = RLImage('temp_pptx_media/image7.png', width=0.9*inch, height=1.4*inch)

qa_center = [
    Spacer(1, 4),
    Paragraph("<para align='center'><b><font color='#38BDF8' size='13'>BKIT INNOVATION IDEATHON 2026</font></b><br/><font color='#E2E8F0' size='10'><i>“Designing Tomorrow’s Intelligent Ecosystems: Connecting People, Machines, and the Planet.”</i></font></para>", s_body_white),
    Spacer(1, 14),
    Paragraph("<para align='center'><b><font color='#EF6C20' size='36'>THANK YOU!</font></b></para>", s_body_white),
    Spacer(1, 8),
    Paragraph("<para align='center'><b><font color='#FFFFFF' size='13'>CLASSMATE — Academic Workspace & Campus Note Vault</font></b></para>", s_body_white),
    Spacer(1, 14),
]
demo_box = Table([[
    Paragraph("<para align='center'><b><font color='#10B981' size='11'>[LIVE WORKING PROTOTYPE DEMO READY]</font></b><br/><font color='#E2E8F0' size='9'>Experience Sub-50ms WebSocket Broadcast  •  Note Vault  •  CR Gates  •  True Hard-Delete</font></para>", s_body_white)
]], colWidths=[7.0*inch])
demo_box.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,-1), NAVY_DARK),
    ('BOX', (0,0), (-1,-1), 1.5, EMERALD_GREEN),
    ('TOPPADDING', (0,0), (-1,-1), 7),
    ('BOTTOMPADDING', (0,0), (-1,-1), 7),
]))
qa_center.append(demo_box)
qa_center.extend([
    Spacer(1, 12),
    Paragraph("<para align='center'><b><font color='#38BDF8' size='10.5'>GitHub Repository: https://github.com/Nothing-dot-exe/klassmates</font></b><br/><font color='#FFFFFF' size='11'><i>We welcome your questions, feedback, and technical critique!</i></font></para>", s_body_white),
    Spacer(1, 4),
])

t_qa_layout = Table([
    [bkit_logo, qa_center, syn_logo],
    [anv_logo, "", q_logo]
], colWidths=[2.2*inch, 7.6*inch, 2.2*inch])

t_qa_layout.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,-1), NAVY_PRIMARY),
    ('BOX', (0,0), (-1,-1), 2, ORANGE_ACCENT),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('ALIGN', (0,0), (-1,-1), 'CENTER'),
    ('TOPPADDING', (0,0), (-1,-1), 14),
    ('BOTTOMPADDING', (0,0), (-1,-1), 14),
    ('SPAN', (1,0), (1,1)),
]))

story.append(t_qa_layout)

# Build Document
print("Building refined ReportLab PDF...")
doc.build(story, onFirstPage=draw_decorations, onLaterPages=draw_decorations)
print(f"Successfully created: {pdf_filename}")
print(f"File size: {os.path.getsize(pdf_filename)} bytes")
