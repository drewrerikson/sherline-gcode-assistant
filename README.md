# Sherline G-code Assistant

A small browser-based assistant that turns simple shop instructions into conservative LinuxCNC-style G-code templates for Sherline mill and lathe workflows.

This project is an aid for drafting and review. It is not a CAM system, controller, simulator, or machine-safety device.

## Safety

Do not run generated code directly on a machine.

Before cutting material:

- Backplot the program in a simulator.
- Single-step the program in air.
- Verify clearances, work offset, tool geometry, spindle direction, feed rates, and units.
- Confirm lathe X diameter/radius mode on your controller.
- Confirm the generated dialect against your Sherline controller and manual.

The app intentionally emits review warnings and blocks copy/download when critical validation issues are present.

## Supported Examples

Mill:

```text
mill a rectangle 1.0 x 0.5 depth 0.05 at x0 y0
drill holes at x0.25 y0.25 and x0.75 y0.25 depth 0.125
mill a circle diameter 0.5 depth 0.04 at x0.5 y0.5
face 1.0 x 0.75 depth 0.005
```

Lathe:

```text
face stock
turn diameter 0.5 length 1.0 depth 0.08
drill depth 0.75
bore diameter 0.4 depth 0.5
```

## Local Development

Run tests:

```bash
npm test
```

Serve the static app with any local static server, for example:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.
