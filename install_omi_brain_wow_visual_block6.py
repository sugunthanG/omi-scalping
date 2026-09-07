from pathlib import Path
from datetime import datetime
import shutil
import re

FILE = Path(r"src\components\scientist\omi-brain-visualizer.tsx")

if not FILE.exists():
    raise SystemExit("[STOP] omi-brain-visualizer.tsx not found")

text = FILE.read_text(encoding="utf-8")

stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
backup = FILE.with_name(
    f"omi-brain-visualizer.before_wow_brain_{stamp}.tsx"
)
shutil.copy2(FILE, backup)

print("=" * 100)
print("OMI BRAIN UI — BLOCK 6")
print("HIGH-SPEED NEURAL ACTIVITY VISUALIZATION")
print("=" * 100)
print(f"[PASS] Backup: {backup.name}")


# -------------------------------------------------------------------
# 1. REPLACE NetworkLines ONLY
# -------------------------------------------------------------------

pattern = re.compile(
    r'function NetworkLines\(\{.*?\n\}\n\n\nfunction NetworkNode',
    re.DOTALL,
)

replacement = r'''function NetworkLines({
  from,
  to,
  active,
  layer,
}: {
  from: BrainNode[];
  to: BrainNode[];
  active: boolean;
  layer: number;
}) {

  return (
    <>

      {from.flatMap(
        (source, sourceIndex) =>
          to.map(
            (target, targetIndex) => {

              const connectionIndex =
                sourceIndex * to.length
                + targetIndex;

              const pathId =
                `omi-neural-${layer}-${sourceIndex}-${targetIndex}`;

              const phase =
                (
                  connectionIndex * 0.071
                  + layer * 0.13
                ) % 0.9;

              const fastDuration =
                0.42
                + (
                  (
                    connectionIndex
                    + layer
                  ) % 5
                ) * 0.055;

              const slowDuration =
                0.75
                + (
                  (
                    connectionIndex
                    + layer * 2
                  ) % 6
                ) * 0.07;

              return (
                <g key={pathId}>

                  {/* Permanent neural synapse */}
                  <line
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    stroke="currentColor"
                    strokeWidth="0.7"
                    className={
                      active
                        ? "text-amber-500/15"
                        : "text-slate-800/70"
                    }
                  />


                  {/* Fast electrical dash */}
                  {active && (
                    <line
                      x1={source.x}
                      y1={source.y}
                      x2={target.x}
                      y2={target.y}
                      stroke="currentColor"
                      strokeWidth={
                        connectionIndex % 4 === 0
                          ? "1.5"
                          : "0.9"
                      }
                      strokeDasharray={
                        connectionIndex % 3 === 0
                          ? "3 17"
                          : "2 21"
                      }
                      strokeLinecap="round"
                      className={
                        connectionIndex % 5 === 0
                          ? "text-yellow-200/80"
                          : "text-amber-400/55"
                      }
                    >

                      <animate
                        attributeName="stroke-dashoffset"
                        from="24"
                        to="0"
                        dur={`${fastDuration}s`}
                        begin={`-${phase}s`}
                        repeatCount="indefinite"
                      />

                      <animate
                        attributeName="opacity"
                        values="0.15;0.95;0.25;0.7;0.15"
                        dur={`${slowDuration}s`}
                        begin={`-${phase}s`}
                        repeatCount="indefinite"
                      />

                    </line>
                  )}


                  {/* Travelling neural impulse */}
                  {active
                    && connectionIndex % 2 === 0
                    && (
                      <circle
                        r={
                          connectionIndex % 6 === 0
                            ? "2.8"
                            : "1.8"
                        }
                        className={
                          connectionIndex % 6 === 0
                            ? "fill-yellow-200"
                            : "fill-amber-400"
                        }
                      >

                        <animate
                          attributeName="cx"
                          from={String(source.x)}
                          to={String(target.x)}
                          dur={`${fastDuration + 0.16}s`}
                          begin={`-${phase}s`}
                          repeatCount="indefinite"
                        />

                        <animate
                          attributeName="cy"
                          from={String(source.y)}
                          to={String(target.y)}
                          dur={`${fastDuration + 0.16}s`}
                          begin={`-${phase}s`}
                          repeatCount="indefinite"
                        />

                        <animate
                          attributeName="opacity"
                          values="0;1;1;0"
                          dur={`${fastDuration + 0.16}s`}
                          begin={`-${phase}s`}
                          repeatCount="indefinite"
                        />

                      </circle>
                    )
                  }


                  {/* Secondary micro impulse */}
                  {active
                    && connectionIndex % 5 === 0
                    && (
                      <circle
                        r="1.2"
                        className="fill-sky-300"
                      >

                        <animate
                          attributeName="cx"
                          from={String(source.x)}
                          to={String(target.x)}
                          dur={`${slowDuration}s`}
                          begin={`-${phase + 0.21}s`}
                          repeatCount="indefinite"
                        />

                        <animate
                          attributeName="cy"
                          from={String(source.y)}
                          to={String(target.y)}
                          dur={`${slowDuration}s`}
                          begin={`-${phase + 0.21}s`}
                          repeatCount="indefinite"
                        />

                        <animate
                          attributeName="opacity"
                          values="0;0.9;0.9;0"
                          dur={`${slowDuration}s`}
                          begin={`-${phase + 0.21}s`}
                          repeatCount="indefinite"
                        />

                      </circle>
                    )
                  }

                </g>
              );
            }),
      )}

    </>
  );
}


function NetworkNode'''

matches = pattern.findall(text)

if len(matches) != 1:
    raise SystemExit(
        f"[STOP] Expected exactly one NetworkLines block; found {len(matches)}"
    )

text = pattern.sub(
    replacement,
    text,
    count=1,
)

print("[PASS] Multi-speed neural connections installed")
print("[PASS] Travelling electrical impulses installed")
print("[PASS] Secondary micro-signals installed")


# -------------------------------------------------------------------
# 2. UPGRADE NODE VISUALS
# -------------------------------------------------------------------

old_node_return = '''  return (
    <g>
      <circle
        cx={node.x}
        cy={node.y}
        r="17"
        className={outerClass}
        strokeWidth="2"
      />

      <circle
        cx={node.x}
        cy={node.y}
        r="5"
        className={innerClass}
      />
    </g>
  );'''

new_node_return = '''  return (
    <g>

      {(active || selected) && (
        <>

          <circle
            cx={node.x}
            cy={node.y}
            r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.8"
            className={
              selected
                ? (
                  selectedTone === "buy"
                    ? "text-emerald-400/40"
                    : selectedTone === "sell"
                      ? "text-red-400/40"
                      : "text-amber-400/40"
                )
                : "text-amber-400/30"
            }
          >
            <animate
              attributeName="r"
              values="18;25;18"
              dur="1.15s"
              repeatCount="indefinite"
            />

            <animate
              attributeName="opacity"
              values="0.8;0;0.8"
              dur="1.15s"
              repeatCount="indefinite"
            />
          </circle>


          <circle
            cx={node.x}
            cy={node.y}
            r="14"
            className={
              selected
                ? (
                  selectedTone === "buy"
                    ? "fill-emerald-400/10"
                    : selectedTone === "sell"
                      ? "fill-red-400/10"
                      : "fill-amber-400/10"
                )
                : "fill-amber-400/10"
            }
          >
            <animate
              attributeName="r"
              values="12;18;13"
              dur="0.72s"
              repeatCount="indefinite"
            />
          </circle>

        </>
      )}


      <circle
        cx={node.x}
        cy={node.y}
        r="17"
        className={outerClass}
        strokeWidth="2"
      >
        {(active || selected) && (
          <animate
            attributeName="stroke-width"
            values="1.5;3;1.5"
            dur="0.65s"
            repeatCount="indefinite"
          />
        )}
      </circle>


      <circle
        cx={node.x}
        cy={node.y}
        r="5"
        className={innerClass}
      >
        {(active || selected) && (
          <animate
            attributeName="r"
            values="3.5;6.5;4;7;3.5"
            dur="0.58s"
            repeatCount="indefinite"
          />
        )}
      </circle>


      {(active || selected) && (
        <circle
          cx={node.x}
          cy={node.y}
          r="2"
          className="fill-yellow-100"
        >
          <animate
            attributeName="opacity"
            values="0.15;1;0.25;0.8;0.15"
            dur="0.38s"
            repeatCount="indefinite"
          />
        </circle>
      )}

    </g>
  );'''

if old_node_return not in text:
    raise SystemExit(
        "[STOP] Exact NetworkNode render block not found. Backup preserved."
    )

text = text.replace(
    old_node_return,
    new_node_return,
    1,
)

print("[PASS] Neural node ripple system installed")
print("[PASS] Node micro-pulse system installed")


# -------------------------------------------------------------------
# 3. ADD LAYER IDs TO THREE VERIFIED CALLS
# -------------------------------------------------------------------

old_calls = [
'''                <NetworkLines
                  from={inputNodes}
                  to={hiddenOne}
                  active={live}
                />''',

'''                <NetworkLines
                  from={hiddenOne}
                  to={hiddenTwo}
                  active={live}
                />''',

'''                <NetworkLines
                  from={hiddenTwo}
                  to={outputNodes}
                  active={live}
                />''',
]

new_calls = [
'''                <NetworkLines
                  from={inputNodes}
                  to={hiddenOne}
                  active={live}
                  layer={1}
                />''',

'''                <NetworkLines
                  from={hiddenOne}
                  to={hiddenTwo}
                  active={live}
                  layer={2}
                />''',

'''                <NetworkLines
                  from={hiddenTwo}
                  to={outputNodes}
                  active={live}
                  layer={3}
                />''',
]

for old, new in zip(old_calls, new_calls):

    if text.count(old) != 1:
        raise SystemExit(
            "[STOP] Expected neural layer call not found exactly once."
        )

    text = text.replace(
        old,
        new,
        1,
    )

print("[PASS] Three neural layers independently phased")


# -------------------------------------------------------------------
# 4. ADD SVG GLOW FILTER
# -------------------------------------------------------------------

svg_anchor = '''              >

                <NetworkLines'''

svg_replacement = '''              >

                <defs>

                  <filter
                    id="omi-neural-glow"
                    x="-100%"
                    y="-100%"
                    width="300%"
                    height="300%"
                  >
                    <feGaussianBlur
                      stdDeviation="2.4"
                      result="blur"
                    />

                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>

                </defs>


                <g filter="url(#omi-neural-glow)">

                <NetworkLines'''

if text.count(svg_anchor) != 1:
    raise SystemExit(
        "[STOP] SVG neural anchor not found exactly once."
    )

text = text.replace(
    svg_anchor,
    svg_replacement,
    1,
)


output_anchor = '''                {outputNodes.map(
                  (node, index) => {'''

if text.count(output_anchor) != 1:
    raise SystemExit(
        "[STOP] Output-node anchor not found exactly once."
    )

# We intentionally close the glow group immediately before
# output nodes so labels remain crisp.
text = text.replace(
    output_anchor,
    '''                </g>


                {outputNodes.map(
                  (node, index) => {''',
    1,
)

print("[PASS] Neural electrical glow installed")


# -------------------------------------------------------------------
# 5. FIX KNOWN ENCODING ARTIFACTS IN THIS FILE
# -------------------------------------------------------------------

replacements = {
    "â€”": "—",
    "â†’": "→",
}

for bad, good in replacements.items():
    text = text.replace(
        bad,
        good,
    )

print("[PASS] Known encoding artifacts cleaned")


# -------------------------------------------------------------------
# 6. FIX EXISTING px-3py-1.5 TYPO
# -------------------------------------------------------------------

text = text.replace(
    "px-3py-1.5",
    "px-3 py-1.5",
)

print("[PASS] Existing telemetry badge spacing typo corrected")


# -------------------------------------------------------------------
# WRITE
# -------------------------------------------------------------------

FILE.write_text(
    text,
    encoding="utf-8",
)

print("[PASS] Visualizer updated")
print("[PASS] Backend untouched")
print("[PASS] MT5 untouched")
print("[PASS] Trading authority untouched")
print("[PASS] session_filter.py untouched")
print()
print("=" * 100)
print("BLOCK 6 FILE INSTALLATION COMPLETE")
print("=" * 100)
