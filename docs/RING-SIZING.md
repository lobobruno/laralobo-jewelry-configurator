# Medidor de anéis

Route: `/medidor-de-aneis`. Uses ABNT numbering, confirmed by the owner.
Estimated aro = rounded internal circumference in millimetres minus 40.
The outside edge of the thin circle outline represents the internal diameter.

## Assisted calibration

Browser screen dimensions are CSS pixels, not millimetres. Pixel ratio is not
physical PPI. Device hints may expose an Android model, but Safari does not offer
an exact iPhone model. We therefore suggest an initial scale only for the finite
display profiles in `lib/screen-calibration.ts`; we never mark it calibrated.
The customer must still confirm the 20 mm reference with a physical ruler.
Manual adjustments always win over pending device detection.

Lookup is browser-local, requests only the optional model hint, has a 1.5 second
deadline, and sends/stores no device data. Missing, denied, unknown, mismatched,
or zoomed profiles use manual calibration. Desktop resolution never implies PPI.
Orientation, pixel-ratio, viewport-scale, and window-width changes invalidate a
confirmed calibration. Height-only changes (mobile browser toolbar) do not.

## Profile sources (checked 2026-09-20)

- Apple display resolution and PPI: [SE](https://support.apple.com/en-us/111882),
  [11](https://support.apple.com/en-us/111865),
  [14](https://support.apple.com/en-us/111850),
  [14 Plus](https://support.apple.com/en-us/111854),
  [14 Pro Max](https://support.apple.com/en-us/111846),
  [16](https://support.apple.com/en-us/121029),
  [16 Pro](https://support.apple.com/en-us/121031),
  [16 Pro Max](https://support.apple.com/en-us/121032).
  An iPhone match means a compatible display profile, NOT identification of one
  of these models. Other iPhones can share the same display profile. Display Zoom
  can also mimic another model. In particular 375 × 812 CSS-pixel profiles are
  excluded because mini/non-mini devices have different physical screen scales.
- [Pixel 9](https://support.google.com/pixelphone/answer/7158570?hl=en):
  1080 × 2424, 422 PPI. Requires exact model `Pixel 9`.
- [Galaxy S24](https://www.samsung.com/in/smartphones/galaxy-s/galaxy-s24-onyx-black-128gb-sm-s921ezkiins/):
  1080 × 2340, 156.4 mm full-rectangle diagonal. Requires SM-S921 model family.
  PPI is calculated from the full rectangle, not the rounded-corner diagonal.
- [Screen.width](https://developer.mozilla.org/en-US/docs/Web/API/Screen/width),
  [pixel ratio](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio),
  [optional model hints](https://developer.mozilla.org/en-US/docs/Web/API/NavigatorUAData/getHighEntropyValues).

Add a profile only after checking manufacturer dimensions. Never infer Android
PPI from a shared resolution. Published dimensions are rounded; verify physical
accuracy on actual hardware before treating any estimate as automatic calibration.

Checks: `node --experimental-strip-types --test tests/screen-calibration.test.ts`,
`pnpm typecheck`, `pnpm build`. Browser QA covers the fallback and manual flow;
pure tests cover device signals. Those tests do not replace physical ruler checks.
