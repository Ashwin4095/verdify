import re

with open('src/pages/PrintReport.jsx', 'r') as f:
    content = f.read()

# FIX 1
content = content.replace(
    'className="fixed top-0 left-0 w-full bg-[#2E4036] px-[24px] py-[10px] flex justify-between items-center z-50 print:hidden"',
    'className="fixed top-0 left-0 w-full bg-[#2E4036] px-[24px] py-[10px] flex justify-between items-center z-50 screen-only-toolbar"'
)

style_insertion = """          .screen-only-toolbar {
            display: none !important;
          }"""
content = content.replace(
    '          .no-break {\\n            page-break-inside: avoid;\\n          }',
    f'          .no-break {{\\n            page-break-inside: avoid;\\n          }}\\n{style_insertion}'
)

# FIX 2
# We must keep .no-break in the CSS block, so we only remove it from classNames
content = re.sub(r'className="([^"]*)no-break([^"]*)"', lambda m: f'className="{m.group(1).rstrip()}{m.group(2)}"', content)
# Clean up extra spaces if they happen
content = content.replace('className="mb-10  p-[12px_16px]', 'className="mb-10 p-[12px_16px]')
content = content.replace('className=" "', 'className=""')

# FIX 3
beige_block_before = """          #root, #root *, body, html,
          .min-h-screen, [class*="min-h"],
         {
            min-height: 0 !important;
            height: auto !important;
          }
          #root, body {
            background: white !important;
          }"""

beige_block_after = """          #root, body, html {
            min-height: 0 !important;
            height: auto !important;
            background: white !important;
          }
          .min-h-screen {
            min-height: 0 !important;
          }"""

content = content.replace(beige_block_before, beige_block_after)

with open('src/pages/PrintReport.jsx', 'w') as f:
    f.write(content)

