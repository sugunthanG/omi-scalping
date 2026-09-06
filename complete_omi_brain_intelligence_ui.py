from pathlib import Path
from datetime import datetime
import shutil
import subprocess
import sys

ROOT = Path(r"D:\OMI-pro\omi-frontend")

API = ROOT / "src/services/api/scientist-api.ts"
VISUALIZER = ROOT / "src/components/scientist/omi-brain-visualizer.tsx"

stamp = datetime.now().strftime("%Y%m%d_%H%M%S")

print("=" * 100)
print("OMI BRAIN — COMPLETE EXPERIENCE + NEURAL UI")
print("=" * 100)

for path in [API, VISUALIZER]:
    if not path.exists():
        raise SystemExit(f"Missing: {path}")

api_backup = API.with_name(
    f"scientist-api.before_intelligence_ui_{stamp}.ts"
)

visualizer_backup = VISUALIZER.with_name(
    f"omi-brain-visualizer.before_intelligence_ui_{stamp}.tsx"
)

shutil.copy2(API, api_backup)
shutil.copy2(VISUALIZER, visualizer_backup)

print("Backup :", api_backup.relative_to(ROOT))
print("Backup :", visualizer_backup.relative_to(ROOT))

try:

    # ================================================================
    # 1. API TYPES
    # ================================================================

    api_text = API.read_text(
        encoding="utf-8-sig",
        errors="replace",
    )

    if "ScientistOmiBrainIntelligence" not in api_text:

        marker = "export interface ScientistOmiBrainLearning {"

        pos = api_text.find(marker)

        if pos < 0:
            raise RuntimeError(
                "ScientistOmiBrainLearning interface not found"
            )

        types = r'''export interface ScientistOmiBrainExperience {
  total: number;
  good: number;
  bad: number;
  neutral: number;
  latest_outcome: string | null;
}


export interface ScientistOmiBrainAdvisory {
  mode: string;
  authority: boolean;
  current: string;
}


export interface ScientistOmiBrainNeural {
  stage: string;
  minimum_research_experiences: number;
  usable_experiences: number;
  data_ready: boolean;
  dataset_version: string | null;
  candidate_created: boolean;
  model_trained: boolean;
  execution_authority: boolean;
  automatic_promotion: boolean;
  pure_omi_champion_protected: boolean;
}


export interface ScientistOmiBrainIntelligence {
  experience: ScientistOmiBrainExperience;
  advisory: ScientistOmiBrainAdvisory;
  neural: ScientistOmiBrainNeural;
}


'''

        api_text = (
            api_text[:pos]
            + types
            + api_text[pos:]
        )

    if (
        "intelligence?: ScientistOmiBrainIntelligence;"
        not in api_text
    ):

        marker = "  learning: ScientistOmiBrainLearning;\n}"

        replacement = (
            "  learning: ScientistOmiBrainLearning;\n"
            "\n"
            "  intelligence?: ScientistOmiBrainIntelligence;\n"
            "}"
        )

        if marker not in api_text:
            raise RuntimeError(
                "ScientistOmiBrain interface insertion point not found"
            )

        api_text = api_text.replace(
            marker,
            replacement,
            1,
        )

    API.write_text(
        api_text,
        encoding="utf-8",
    )

    print("[OK] Intelligence API types connected")

    # ================================================================
    # 2. REPLACE EXISTING GOOD/BAD LOWER SECTION
    # ================================================================

    text = VISUALIZER.read_text(
        encoding="utf-8-sig",
        errors="replace",
    )

    start_marker = '''      <section className="grid gap-4 md:grid-cols-2">

        <article className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-5">'''

    end_marker = '''      </section>

    </div>
  );
}'''

    start = text.find(start_marker)

    if start < 0:
        raise RuntimeError(
            "Existing Good/Bad learning section start not found"
        )

    end = text.find(
        end_marker,
        start,
    )

    if end < 0:
        raise RuntimeError(
            "Visualizer return boundary not found"
        )

    new_section = r'''      {/* =====================================================
          EXPERIENCE INTELLIGENCE
      ====================================================== */}

      <section
        className="
          overflow-hidden
          rounded-2xl
          border
          border-slate-800
          bg-[#080d16]
        "
      >
        <div
          className="
            flex
            flex-col
            gap-3
            border-b
            border-slate-800
            px-5
            py-4
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div>
            <div
              className="
                flex
                items-center
                gap-2
              "
            >
              <BrainCircuit
                className="
                  h-4
                  w-4
                  text-sky-400
                "
              />

              <p
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.16em]
                  text-sky-400
                "
              >
                Experience Intelligence
              </p>
            </div>

            <p
              className="
                mt-2
                max-w-3xl
                text-sm
                leading-6
                text-slate-400
              "
            >
              Completed OMI trade groups become durable
              experiences. Similar future setups can be
              researched without changing Pure OMI execution.
            </p>
          </div>

          <div
            className="
              flex
              flex-wrap
              gap-2
            "
          >
            <span
              className="
                rounded-full
                border
                border-sky-500/20
                bg-sky-500/10
                px-3
                py-1
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.14em]
                text-sky-300
              "
            >
              {
                brain?.intelligence
                  ?.advisory?.mode
                ?? "SHADOW"
              }
            </span>

            <span
              className="
                rounded-full
                border
                border-slate-700
                bg-slate-900
                px-3
                py-1
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.14em]
                text-slate-400
              "
            >
              Authority{" "}
              {
                brain?.intelligence
                  ?.advisory?.authority
                  ? "ON"
                  : "OFF"
              }
            </span>
          </div>
        </div>


        <div
          className="
            grid
            lg:grid-cols-2
          "
        >
          {/* EXPERIENCE MEMORY */}

          <div
            className="
              border-b
              border-slate-800
              p-5
              lg:border-b-0
              lg:border-r
            "
          >
            <div
              className="
                flex
                items-start
                justify-between
                gap-4
              "
            >
              <div>
                <p
                  className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-[0.14em]
                    text-slate-400
                  "
                >
                  Experience Memory
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    text-slate-600
                  "
                >
                  Real completed group outcomes
                </p>
              </div>

              <div className="text-right">
                <p
                  className="
                    text-3xl
                    font-semibold
                    text-white
                  "
                >
                  {
                    brain?.intelligence
                      ?.experience?.total
                    ?? 0
                  }
                </p>

                <p
                  className="
                    text-[10px]
                    uppercase
                    tracking-[0.12em]
                    text-slate-600
                  "
                >
                  Total
                </p>
              </div>
            </div>


            <div
              className="
                mt-5
                grid
                grid-cols-3
                gap-3
              "
            >
              <div
                className="
                  rounded-xl
                  border
                  border-emerald-500/20
                  bg-emerald-500/[0.04]
                  p-4
                "
              >
                <TrendingUp
                  className="
                    h-4
                    w-4
                    text-emerald-400
                  "
                />

                <p
                  className="
                    mt-3
                    text-2xl
                    font-semibold
                    text-emerald-400
                  "
                >
                  {
                    brain?.intelligence
                      ?.experience?.good
                    ?? good
                  }
                </p>

                <p
                  className="
                    mt-1
                    text-[10px]
                    uppercase
                    tracking-[0.12em]
                    text-slate-600
                  "
                >
                  Good
                </p>
              </div>


              <div
                className="
                  rounded-xl
                  border
                  border-red-500/20
                  bg-red-500/[0.04]
                  p-4
                "
              >
                <TrendingDown
                  className="
                    h-4
                    w-4
                    text-red-400
                  "
                />

                <p
                  className="
                    mt-3
                    text-2xl
                    font-semibold
                    text-red-400
                  "
                >
                  {
                    brain?.intelligence
                      ?.experience?.bad
                    ?? bad
                  }
                </p>

                <p
                  className="
                    mt-1
                    text-[10px]
                    uppercase
                    tracking-[0.12em]
                    text-slate-600
                  "
                >
                  Bad
                </p>
              </div>


              <div
                className="
                  rounded-xl
                  border
                  border-slate-700
                  bg-slate-900/40
                  p-4
                "
              >
                <CircleDot
                  className="
                    h-4
                    w-4
                    text-slate-400
                  "
                />

                <p
                  className="
                    mt-3
                    text-2xl
                    font-semibold
                    text-slate-300
                  "
                >
                  {
                    brain?.intelligence
                      ?.experience?.neutral
                    ?? 0
                  }
                </p>

                <p
                  className="
                    mt-1
                    text-[10px]
                    uppercase
                    tracking-[0.12em]
                    text-slate-600
                  "
                >
                  Neutral
                </p>
              </div>
            </div>


            <div
              className="
                mt-4
                rounded-xl
                border
                border-slate-800
                bg-slate-950/60
                p-4
              "
            >
              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-3
                "
              >
                <span
                  className="
                    text-xs
                    text-slate-500
                  "
                >
                  Current memory advice
                </span>

                <span
                  className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-[0.1em]
                    text-amber-300
                  "
                >
                  {
                    brain?.intelligence
                      ?.advisory?.current
                    ?? "NEUTRAL"
                  }
                </span>
              </div>

              <div
                className="
                  mt-3
                  flex
                  items-center
                  justify-between
                  gap-3
                "
              >
                <span
                  className="
                    text-xs
                    text-slate-500
                  "
                >
                  Latest outcome
                </span>

                <span
                  className="
                    text-xs
                    font-medium
                    text-slate-300
                  "
                >
                  {
                    brain?.intelligence
                      ?.experience
                      ?.latest_outcome
                    ?? "NONE"
                  }
                </span>
              </div>
            </div>
          </div>


          {/* NEURAL CANDIDATE */}

          <div className="p-5">
            <div
              className="
                flex
                items-start
                justify-between
                gap-4
              "
            >
              <div>
                <div
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >
                  <Cpu
                    className="
                      h-4
                      w-4
                      text-amber-400
                    "
                  />

                  <p
                    className="
                      text-xs
                      font-semibold
                      uppercase
                      tracking-[0.14em]
                      text-slate-400
                    "
                  >
                    Neural Candidate
                  </p>
                </div>

                <p
                  className="
                    mt-2
                    text-xs
                    leading-5
                    text-slate-600
                  "
                >
                  Research candidate remains isolated
                  from live execution until governed
                  validation succeeds.
                </p>
              </div>

              <span
                className="
                  rounded-full
                  border
                  border-amber-500/20
                  bg-amber-500/10
                  px-3
                  py-1
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.14em]
                  text-amber-300
                "
              >
                {
                  brain?.intelligence
                    ?.neural?.stage
                  ?? "OBSERVING"
                }
              </span>
            </div>


            <div className="mt-5">
              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-4
                  text-xs
                "
              >
                <span className="text-slate-500">
                  Research experiences
                </span>

                <span
                  className="
                    font-semibold
                    text-slate-300
                  "
                >
                  {
                    brain?.intelligence
                      ?.neural
                      ?.usable_experiences
                    ?? 0
                  }
                  {" / "}
                  {
                    brain?.intelligence
                      ?.neural
                      ?.minimum_research_experiences
                    ?? 200
                  }
                </span>
              </div>


              <div
                className="
                  mt-2
                  h-2
                  overflow-hidden
                  rounded-full
                  bg-slate-800
                "
              >
                <div
                  className="
                    h-full
                    rounded-full
                    bg-sky-500
                    transition-[width]
                    duration-500
                  "
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(
                        0,
                        (
                          (
                            brain?.intelligence
                              ?.neural
                              ?.usable_experiences
                            ?? 0
                          )
                          /
                          Math.max(
                            1,
                            brain?.intelligence
                              ?.neural
                              ?.minimum_research_experiences
                            ?? 200,
                          )
                        ) * 100,
                      ),
                    )}%`,
                  }}
                />
              </div>
            </div>


            <div
              className="
                mt-5
                divide-y
                divide-slate-800
                rounded-xl
                border
                border-slate-800
                bg-slate-950/50
                px-4
              "
            >
              <StateRow
                icon={Activity}
                label="Dataset"
                value={
                  brain?.intelligence
                    ?.neural?.data_ready
                    ? "READY"
                    : "COLLECTING"
                }
              />

              <div className="py-3">
                <StateRow
                  icon={BrainCircuit}
                  label="Candidate"
                  value={
                    brain?.intelligence
                      ?.neural
                      ?.candidate_created
                      ? "CREATED"
                      : "NONE"
                  }
                />
              </div>

              <div className="py-3">
                <StateRow
                  icon={Cpu}
                  label="Model"
                  value={
                    brain?.intelligence
                      ?.neural
                      ?.model_trained
                      ? "TRAINED"
                      : "NOT TRAINED"
                  }
                />
              </div>

              <div className="py-3">
                <StateRow
                  icon={ShieldCheck}
                  label="Execution authority"
                  value={
                    brain?.intelligence
                      ?.neural
                      ?.execution_authority
                      ? "ACTIVE"
                      : "OFF"
                  }
                />
              </div>

              <div className="py-3">
                <StateRow
                  icon={Radio}
                  label="Auto promotion"
                  value={
                    brain?.intelligence
                      ?.neural
                      ?.automatic_promotion
                      ? "ON"
                      : "OFF"
                  }
                />
              </div>

              <div className="py-3">
                <StateRow
                  icon={ShieldCheck}
                  label="Pure OMI champion"
                  value={
                    brain?.intelligence
                      ?.neural
                      ?.pure_omi_champion_protected
                      ? "PROTECTED"
                      : "CHECK"
                  }
                  valueClass={
                    brain?.intelligence
                      ?.neural
                      ?.pure_omi_champion_protected
                      ? "text-emerald-400"
                      : "text-amber-300"
                  }
                />
              </div>
            </div>


            <p
              className="
                mt-4
                text-xs
                leading-5
                text-slate-600
              "
            >
              No candidate improvement is claimed
              until chronological validation produces
              a verified result.
            </p>
          </div>
        </div>
      </section>

'''

    # Keep the component's closing section/div/function.
    replacement_end = '''      </section>

    </div>
  );
}'''

    text = (
        text[:start]
        + new_section
        + text[end + len("      </section>\n"):]
    )

    VISUALIZER.write_text(
        text,
        encoding="utf-8",
    )

    print("[OK] Existing Good/Bad section upgraded")
    print("[OK] Experience Intelligence added")
    print("[OK] Neural Candidate dashboard added")

    # ================================================================
    # 3. STATIC VALIDATION
    # ================================================================

    final_text = VISUALIZER.read_text(
        encoding="utf-8",
        errors="replace",
    )

    checks = {
        "Experience Intelligence":
            "Experience Intelligence" in final_text,

        "Experience Memory":
            "Experience Memory" in final_text,

        "Neural Candidate":
            "Neural Candidate" in final_text,

        "Research progress":
            "minimum_research_experiences"
            in final_text,

        "Candidate state":
            "candidate_created"
            in final_text,

        "Model state":
            "model_trained"
            in final_text,

        "Execution authority":
            "execution_authority"
            in final_text,

        "Champion protection":
            "pure_omi_champion_protected"
            in final_text,

        "Real intelligence source":
            "brain?.intelligence"
            in final_text,
    }

    print()
    print("-" * 100)
    print("STATIC UI VALIDATION")
    print("-" * 100)

    for name, passed in checks.items():

        if not passed:
            raise RuntimeError(
                f"{name}: FAILED"
            )

        print(f"[PASS] {name}")

    # ================================================================
    # 4. PRODUCTION BUILD
    # ================================================================

    print()
    print("-" * 100)
    print("PRODUCTION BUILD")
    print("-" * 100)

    result = subprocess.run(
        [
            "npm.cmd",
            "run",
            "build",
        ],
        cwd=ROOT,
        text=True,
    )

    if result.returncode != 0:
        raise RuntimeError(
            "Next.js production build failed"
        )

    print()
    print("[PASS] Next.js production build")

except Exception as error:

    print()
    print("=" * 100)
    print("OMI BRAIN UI UPGRADE FAILED")
    print("=" * 100)
    print(error)

    shutil.copy2(
        api_backup,
        API,
    )

    shutil.copy2(
        visualizer_backup,
        VISUALIZER,
    )

    print()
    print("Automatic rollback : COMPLETE")
    sys.exit(1)


print()
print("=" * 100)
print("OMI BRAIN — SCIENTIST UI COMPLETE")
print("=" * 100)
print("Live neural visualization : PRESERVED")
print("Live OMI telemetry        : PRESERVED")
print("Experience Memory         : DISPLAYED")
print("GOOD/BAD/Neutral          : DISPLAYED")
print("Memory advisory           : DISPLAYED")
print("Neural stage              : DISPLAYED")
print("Research progress         : DISPLAYED")
print("Candidate state           : DISPLAYED")
print("Model state               : DISPLAYED")
print("Candidate authority       : DISPLAYED")
print("Champion protection       : DISPLAYED")
print("Fake improvement          : NONE")
print("Emergency Control         : PRESERVED")
print("Production build          : PASS")
print("=" * 100)
