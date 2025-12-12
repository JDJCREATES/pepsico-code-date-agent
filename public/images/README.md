# Code Date Images - Blender Reference Guide

This folder contains product images for the code date analyzer demo. Create these images in Blender to simulate real production scenarios.

## Folder Structure

```
public/images/
├── good/                           # Products that pass QC
│   ├── 84-day-no-price-good-1.jpg
│   ├── 84-day-price-good-1.jpg
│   ├── 90-day-no-price-good-1.jpg
│   └── 90-day-price-good-1.jpg
│
└── bad/                            # Products with violations
    ├── positioning/                # Code date placement issues
    │   ├── 84-day-off-bellmark-1.jpg
    │   └── 90-day-on-bellmark-1.jpg
    │
    ├── quality/                    # Print quality issues
    │   └── 84-day-faded-print-1.jpg
    │
    └── incorrect/                  # Wrong marking type
        ├── 84-day-wrong-type-1.jpg
        ├── 84-day-missing-price-1.jpg
        └── 90-day-wrong-price-1.jpg
```

## Product Types

### 84-Day Products
- **84-day no price**: Standard 84-day shelf life, no price on package
- **84-day price**: Standard 84-day shelf life, price printed on package

### 90-Day Products
- **90-day no price**: Extended 90-day shelf life, no price on package
- **90-day price**: Extended 90-day shelf life, price printed on package

## Violation Types to Create

### 1. GOOD Products (Pass QC) ✅
- Code date properly positioned near bellmark
- Clear, readable print
- Correct shelf life type
- Correct price marking presence/absence
- Valid date (not expired)

### 2. Positioning Errors (FAIL) ❌

**Code Date Off Bellmark:**
- Code date moved too far from the bellmark
- Still readable but wrong position
- **Severity:** Medium - requires line adjustment

**Code Date ON Bellmark:** 🚨 CRITICAL
- Code date printed directly on top of bellmark
- **Severity:** AUTOMATIC HOLD
- Product MUST be caught before leaving factory
- Most serious violation

### 3. Quality Errors (FAIL) ❌

**Faded Print:**
- Smudged, faded, or unclear code date
- Partially missing ink
- Unreadable characters
- **Severity:** High - product cannot be verified

### 4. Incorrect Marking (FAIL) ❌

**Wrong Code Type:**
- 90-day code on 84-day product (or vice versa)
- Shelf life mismatch
- **Severity:** High - misleading information

**Wrong Price Marking:**
- Should have price but doesn't
- Has price when it shouldn't
- **Severity:** Medium - marketing/sales issue

## Blender Setup Tips

1. **Lighting:** Use realistic factory floor lighting (slightly harsh overhead)
2. **Camera Angle:** Simulate overhead conveyor belt camera
3. **Resolution:** 1920x1080 for realistic security camera quality
4. **Blur:** Add slight motion blur to some images (simulate movement)
5. **Variations:** Create multiple angles/lighting for each type

## Code Date Format Examples

- **PMO:** 4-6 digit facility code (e.g., "12345")
- **Date:** Various formats - DDMMMYY (e.g., "15JAN25")
- **Time:** HH:MM format (e.g., "14:30")
- **Full Example:** "PMO 12345 15JAN25 14:30 84D"

## Bellmark Reference

The **bellmark** is the quality assurance seal/logo typically placed on packaging. Code dates should be:
- ✅ Near the bellmark (within acceptable distance)
- ❌ NOT on top of the bellmark (automatic hold!)
- ✅ Clearly visible and separate

## Testing Priority

Start with these 4 images to test the system:
1. `84-day-no-price-good-1.jpg` - Perfect product
2. `90-day-on-bellmark-1.jpg` - Critical failure
3. `84-day-faded-print-1.jpg` - Quality failure  
4. `84-day-wrong-type-1.jpg` - Marking error

Once these work, expand to full catalog.

## Image Naming Convention

`[shelf-life]-day-[price-status]-[category]-[number].jpg`

Examples:
- `84-day-no-price-good-1.jpg`
- `90-day-price-faded-1.jpg`
- `84-day-no-price-off-bellmark-2.jpg`
