# Template Thumbnails

This directory contains thumbnail images for resume templates.

## Required Files

All template thumbnails should follow the naming pattern: `{Template Name}.png`

### Current Templates:
- Classic Professional.png ✓
- Corporate headshot.png ✓
- Creative Portfolio.png ✓
- Executive.png ✓
- Minimalist.png ✓
- Modern Professional.png ✓
- Traditional.png ✓
- **Modern Sidebar.png** - ⚠️ **MISSING - Needs to be added**

## Adding New Thumbnails

When adding a new template thumbnail:
1. Name the file exactly as the template name (e.g., "Modern Sidebar.png")
2. Place it in this directory
3. The system will automatically generate the path: `/assets/templates/thumbnails/{Template Name}.png`

## Note

The thumbnail URL is automatically generated from the template name using the pattern:
`/assets/templates/thumbnails/{Template Name}.png`

No hardcoded mappings are needed - the system derives the path dynamically.

