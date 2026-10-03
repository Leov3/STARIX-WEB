# Design QA — Sistemas de identidad

## Comparison target

- Source visual truth: user-provided reference screenshot and live `https://animos.app/?ref=unsection.com` showcase section.
- Implementation: `http://localhost:3000/capacidades/marca-presencia-digital#brand-servicios`.
- Implementation viewport: 1965 × 1435 CSS px at DPR 0.667; desktop, dark theme, motion enabled.
- Source normalization: the reference was compared as a desktop showcase composition rather than at pixel-for-pixel scale, because it uses different branding assets and copy.

## Evidence

- Full-view comparison: live browser capture of the STARIX identity section after the update.
- Focused animation check: the reference showcase changed from `translateX(-416.537px)` to `translateX(-454.692px)` over one second. The STARIX showcase changed from `translateX(-32.8796px)` to `translateX(-92.6885px)` over one second.
- Responsive/accessibility motion state: `prefers-reduced-motion: reduce` pauses the continuous showcase loop.
- Console check: no browser console errors.

## Findings

No actionable P0, P1, or P2 findings.

- Fonts and typography: centered hierarchy and small service index preserve the reference's editorial rhythm while using STARIX typography and Spanish copy.
- Spacing and layout rhythm: the heading has clear separation from the horizontally moving panel strip; overflow is intentionally cropped at both viewport edges.
- Colors and visual tokens: black field, restrained borders, off-white typography, and gold brand accents align with the intended dark showcase direction.
- Image quality and asset fidelity: the moving panels use the project's existing STARIX identity artwork; no placeholder or CSS-drawn imagery is used.
- Copy and content: Animos copy and branding were not carried over; STARIX service copy and CTA remain intact.

## Follow-up polish

- [P3] Tune the loop duration after reviewing on a high-refresh-rate display if a faster or slower cadence is desired.

## Final result

passed
