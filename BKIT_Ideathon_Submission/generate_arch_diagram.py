import matplotlib.pyplot as plt
import matplotlib.patches as patches

fig, ax = plt.subplots(figsize=(12, 6.8), dpi=300)
fig.patch.set_facecolor('#0B132B')
ax.set_facecolor('#0B132B')

# Title
ax.text(0.5, 0.95, "CLASSMATE SYSTEM ARCHITECTURE", 
        fontsize=18, fontweight='bold', color='#FFFFFF', ha='center', va='center', fontfamily='sans-serif')
ax.text(0.5, 0.90, "Real-Time WebSocket Engine & Closed-Network Security Isolation", 
        fontsize=11, color='#94A3B8', ha='center', va='center', fontfamily='sans-serif')

def draw_card(ax, x, y, w, h, bg_color, border_color, title, subtitle):
    rect = patches.FancyBboxPatch((x, y), w, h,
                                  boxstyle="round,pad=0.015,rounding_size=0.03",
                                  facecolor=bg_color, edgecolor=border_color, linewidth=2)
    ax.add_patch(rect)
    ax.text(x + w/2, y + h - 0.04, title, fontsize=12, fontweight='bold', color='#FFFFFF', 
            ha='center', va='center', fontfamily='sans-serif')
    if subtitle:
        ax.text(x + w/2, y + h - 0.08, subtitle, fontsize=9, color='#38BDF8', 
                ha='center', va='center', fontfamily='sans-serif')

def draw_pill(ax, x, y, w, h, bg_color, text, text_color='#FFFFFF', size=8.5, border=None):
    pill = patches.FancyBboxPatch((x, y), w, h,
                                 boxstyle="round,pad=0.01,rounding_size=0.02",
                                 facecolor=bg_color, edgecolor=border if border else 'none', linewidth=1.5 if border else 0)
    ax.add_patch(pill)
    ax.text(x + w/2, y + h/2, text, fontsize=size, fontweight='bold', color=text_color, 
            ha='center', va='center', multialignment='center', fontfamily='sans-serif')

# Direct WebSocket Highway Banner at Top
draw_pill(ax, 0.05, 0.77, 0.90, 0.07, '#064E3B', 
          "⚡ INSTANT PEER-TO-PEER WEBSOCKET BROADCAST (<50ms Latency) — REALTIME DATA SYNC ⚡", 
          text_color='#34D399', size=10, border='#10B981')

# Column 1: Client Browser (Next.js 16 + React 19)
draw_card(ax, 0.04, 0.11, 0.28, 0.63, '#1E293B', '#3B82F6', "CLIENT BROWSER", "Next.js 16 + React 19 (Web & Mobile)")
draw_pill(ax, 0.06, 0.53, 0.24, 0.07, '#0F172A', "Social #general Announcements", text_color='#E2E8F0')
draw_pill(ax, 0.06, 0.44, 0.24, 0.07, '#0F172A', "Isolated 1-on-1 Direct Messaging", text_color='#E2E8F0')
draw_pill(ax, 0.06, 0.35, 0.24, 0.07, '#0F172A', "Campus Note Vault & Markdown", text_color='#E2E8F0')
draw_pill(ax, 0.06, 0.26, 0.24, 0.07, '#0F172A', "Native Camera Whiteboard Capture", text_color='#E2E8F0')
draw_pill(ax, 0.06, 0.13, 0.24, 0.11, '#1E3A8A', "Client Security Gate\n• HMAC Session Signature Store\n• PostgREST Clause Sanitizer", 
          text_color='#93C5FD', size=8)

# Column 2: Serverless API Layer
draw_card(ax, 0.36, 0.11, 0.28, 0.63, '#1E293B', '#F59E0B', "SERVERLESS API LAYER", "Next.js Route Handlers & Auth Guards")
draw_pill(ax, 0.38, 0.53, 0.24, 0.07, '#292524', "IP Rate-Limited Auth (/login)", text_color='#FEF3C7')
draw_pill(ax, 0.38, 0.44, 0.24, 0.07, '#292524', "6-Digit Email OTP Verification", text_color='#FEF3C7')
draw_pill(ax, 0.38, 0.35, 0.24, 0.07, '#292524', "CR Admission Approval Gate", text_color='#FEF3C7')
draw_pill(ax, 0.38, 0.26, 0.24, 0.07, '#292524', "Strict RBAC Admin Middleware", text_color='#FEF3C7')
draw_pill(ax, 0.38, 0.13, 0.24, 0.11, '#78350F', "Server-Side Defenses\n• Anti-Brute Sliding Window\n• Cryptographic Token Verify", 
          text_color='#FDE68A', size=8)

# Column 3: Supabase Cloud Backend
draw_card(ax, 0.68, 0.11, 0.28, 0.63, '#1E293B', '#10B981', "SUPABASE BACKEND", "PostgreSQL & Realtime Cluster")
draw_pill(ax, 0.70, 0.53, 0.24, 0.07, '#064E3B', "Phoenix Channels (WebSockets)", text_color='#A7F3D0')
draw_pill(ax, 0.70, 0.44, 0.24, 0.07, '#064E3B', "True Hard-Delete Purge Engine", text_color='#A7F3D0')
draw_pill(ax, 0.70, 0.35, 0.24, 0.07, '#064E3B', "Auto-Expiring Message Cleanup", text_color='#A7F3D0')
draw_pill(ax, 0.70, 0.26, 0.24, 0.07, '#064E3B', "Encrypted Media Storage (Files)", text_color='#A7F3D0')
draw_pill(ax, 0.70, 0.13, 0.24, 0.11, '#047857', "PostgreSQL Security\n• Row Level Security (RLS)\n• Zero Cross-Classroom Leakage", 
          text_color='#A7F3D0', size=8)

# Subtle Flow Connectors between cards
ax.annotate('', xy=(0.36, 0.48), xytext=(0.32, 0.48),
            arrowprops=dict(facecolor='#38BDF8', edgecolor='none', width=2, headwidth=7))
ax.annotate('', xy=(0.32, 0.39), xytext=(0.36, 0.39),
            arrowprops=dict(facecolor='#F59E0B', edgecolor='none', width=2, headwidth=7))

ax.annotate('', xy=(0.68, 0.48), xytext=(0.64, 0.48),
            arrowprops=dict(facecolor='#F59E0B', edgecolor='none', width=2, headwidth=7))
ax.annotate('', xy=(0.64, 0.39), xytext=(0.68, 0.39),
            arrowprops=dict(facecolor='#10B981', edgecolor='none', width=2, headwidth=7))

# Bottom Verification Badge
draw_card(ax, 0.04, 0.02, 0.92, 0.065, '#0F172A', '#6366F1', "", "")
ax.text(0.5, 0.052, "✔ 64/64 AUTOMATED REGRESSION & SECURITY TESTS PASSING | RBAC ENFORCED | IDOR BOUNDARIES STRICTLY VERIFIED",
        fontsize=9, fontweight='bold', color='#A5B4FC', ha='center', va='center')

ax.set_xlim(0, 1)
ax.set_ylim(0, 1)
ax.axis('off')
plt.tight_layout()
plt.savefig('classmate_architecture.png', bbox_inches='tight', facecolor=fig.get_facecolor(), edgecolor='none')
print("Regenerated clean classmate_architecture.png")
