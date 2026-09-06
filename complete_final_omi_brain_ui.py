from pathlib import Path
from datetime import datetime
import shutil
import subprocess
import sys

ROOT = Path(r"D:\OMI-pro\omi-frontend")

API = ROOT / "src/services/api/scientist-api.ts"
PAGE = ROOT / "src/app/scientist/omi-brain/page.tsx"

stamp = datetime.now().strftime("%Y%m%d_%H%M%S")

print("=" * 100)
print("OMI BRAIN — FINAL SCIENTIST UI")
print("=" * 100)

for path in [API, PAGE]:
    if not path.exists():
        raise SystemExit(
            f"Missing: {path}"
        )

api_backup = API.with_name(
    f"scientist-api.before_final_brain_{stamp}.ts"
)

page_backup = PAGE.with_name(
    f"page.before_final_brain_{stamp}.tsx"
)

shutil.copy2(API, api_backup)
shutil.copy2(PAGE, page_backup)

print(
    "Backup :",
    api_backup.relative_to(ROOT),
)

print(
    "Backup :",
    page_backup.relative_to(ROOT),
)

try:

    # ================================================================
    # 1. EXTEND TYPES WITH REAL INTELLIGENCE
    # ================================================================

    api_text = API.read_text(
        encoding="utf-8-sig",
        errors="replace",
    )

    if (
        "ScientistOmiBrainIntelligence"
        not in api_text
    ):

        marker = (
            "export interface "
            "ScientistOmiBrainLearning {"
        )

        index = api_text.find(marker)

        if index < 0:
            raise RuntimeError(
                "Brain learning interface marker missing"
            )

        intelligence_types = r'''export interface ScientistOmiBrainExperience {
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
            api_text[:index]
            + intelligence_types
            + api_text[index:]
        )

    old_interface_end = '''  learning: ScientistOmiBrainLearning;
}'''

    new_interface_end = '''  learning: ScientistOmiBrainLearning;

  intelligence?: ScientistOmiBrainIntelligence;
}'''

    if (
        "intelligence?: ScientistOmiBrainIntelligence;"
        not in api_text
    ):

        if old_interface_end not in api_text:
            raise RuntimeError(
                "ScientistOmiBrain interface marker missing"
            )

        api_text = api_text.replace(
            old_interface_end,
            new_interface_end,
            1,
        )

    API.write_text(
        api_text,
        encoding="utf-8",
    )

    print(
        "[OK] Real Brain intelligence API types added"
    )

    # ================================================================
    # 2. ADD FINAL INTELLIGENCE PANEL TO PAGE
    # ================================================================

    page_text = PAGE.read_text(
        encoding="utf-8-sig",
        errors="replace",
    )

    if (
        "OMI EXPERIENCE INTELLIGENCE"
        not in page_text
    ):

        # Find Emergency component in the page.
        emergency_markers = [
            "<OmiEmergencyControl",
            "<OmiEmergencyOrderControl",
        ]

        emergency_index = -1

        for marker in emergency_markers:
            emergency_index = (
                page_text.find(marker)
            )

            if emergency_index >= 0:
                break

        if emergency_index < 0:
            raise RuntimeError(
                "Emergency Control component marker missing"
            )

        # Insert directly before the emergency component.
        panel = r'''
        {/* =========================================================
            OMI EXPERIENCE INTELLIGENCE
            Real backend state only — no fabricated learning.
        ========================================================== */}

        <section
          className="
            mb-6
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
              gap-2
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
              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-sky-400
                "
              >
                OMI Experience Intelligence
              </p>

              <h2
                className="
                  mt-1
                  text-base
                  font-semibold
                  text-white
                "
              >
                Self-Improving Research Memory
              </h2>

              <p
                className="
                  mt-1
                  text-xs
                  leading-5
                  text-slate-500
                "
              >
                Real completed OMI outcomes are remembered,
                compared with future setups and prepared for
                governed neural candidate research.
              </p>
            </div>

            <span
              className="
                w-fit
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
                brain?.intelligence?.advisory?.mode
                || "SHADOW"
              }
            </span>
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
                  items-center
                  justify-between
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
                    One completed OMI group =
                    one learning experience.
                  </p>
                </div>

                <div
                  className="
                    text-right
                  "
                >
                  <p
                    className="
                      text-2xl
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
                    Experiences
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
                    border-emerald-500/15
                    bg-emerald-500/[0.04]
                    p-3
                  "
                >
                  <p
                    className="
                      text-[10px]
                      uppercase
                      tracking-[0.12em]
                      text-slate-600
                    "
                  >
                    Good
                  </p>

                  <p
                    className="
                      mt-1
                      text-xl
                      font-semibold
                      text-emerald-400
                    "
                  >
                    {
                      brain?.intelligence
                        ?.experience?.good
                      ?? 0
                    }
                  </p>
                </div>


                <div
                  className="
                    rounded-xl
                    border
                    border-red-500/15
                    bg-red-500/[0.04]
                    p-3
                  "
                >
                  <p
                    className="
                      text-[10px]
                      uppercase
                      tracking-[0.12em]
                      text-slate-600
                    "
                  >
                    Bad
                  </p>

                  <p
                    className="
                      mt-1
                      text-xl
                      font-semibold
                      text-red-400
                    "
                  >
                    {
                      brain?.intelligence
                        ?.experience?.bad
                      ?? 0
                    }
                  </p>
                </div>


                <div
                  className="
                    rounded-xl
                    border
                    border-slate-700
                    bg-slate-900/30
                    p-3
                  "
                >
                  <p
                    className="
                      text-[10px]
                      uppercase
                      tracking-[0.12em]
                      text-slate-600
                    "
                  >
                    Neutral
                  </p>

                  <p
                    className="
                      mt-1
                      text-xl
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
                </div>
              </div>


              <div
                className="
                  mt-4
                  flex
                  items-center
                  justify-between
                  rounded-xl
                  border
                  border-slate-800
                  bg-black/20
                  px-4
                  py-3
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
                    text-amber-300
                  "
                >
                  {
                    brain?.intelligence
                      ?.advisory?.current
                    || "NEUTRAL"
                  }
                </span>
              </div>


              <div
                className="
                  mt-3
                  flex
                  items-center
                  justify-between
                  px-1
                "
              >
                <span
                  className="
                    text-xs
                    text-slate-600
                  "
                >
                  Trading authority
                </span>

                <span
                  className="
                    text-xs
                    font-semibold
                    text-slate-400
                  "
                >
                  {
                    brain?.intelligence
                      ?.advisory?.authority
                      ? "ACTIVE"
                      : "OFF"
                  }
                </span>
              </div>
            </div>


            {/* NEURAL CANDIDATE */}

            <div
              className="
                p-5
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
                    Neural Candidate
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-slate-600
                    "
                  >
                    Candidate training begins only
                    after sufficient real OMI evidence.
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
                    || "OBSERVING"
                  }
                </span>
              </div>


              <div
                className="
                  mt-5
                "
              >
                <div
                  className="
                    flex
                    items-center
                    justify-between
                    text-xs
                  "
                >
                  <span
                    className="
                      text-slate-500
                    "
                  >
                    Research experiences
                  </span>

                  <span
                    className="
                      font-medium
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
                      transition-all
                      duration-500
                    "
                    style={{
                      width:
                        `${Math.min(
                          100,
                          Math.max(
                            0,
                            (
                              (
                                brain
                                  ?.intelligence
                                  ?.neural
                                  ?.usable_experiences
                                ?? 0
                              )
                              /
                              Math.max(
                                1,
                                (
                                  brain
                                    ?.intelligence
                                    ?.neural
                                    ?.minimum_research_experiences
                                  ?? 200
                                ),
                              )
                            )
                            * 100,
                          ),
                        )}%`,
                    }}
                  />
                </div>
              </div>


              <div
                className="
                  mt-5
                  space-y-3
                "
              >
                {
                  [
                    [
                      "Dataset",
                      brain?.intelligence
                        ?.neural?.data_ready
                        ? "READY"
                        : "COLLECTING",
                    ],

                    [
                      "Candidate",
                      brain?.intelligence
                        ?.neural
                        ?.candidate_created
                        ? "CREATED"
                        : "NONE",
                    ],

                    [
                      "Model",
                      brain?.intelligence
                        ?.neural
                        ?.model_trained
                        ? "TRAINED"
                        : "NOT TRAINED",
                    ],

                    [
                      "Execution authority",
                      brain?.intelligence
                        ?.neural
                        ?.execution_authority
                        ? "ACTIVE"
                        : "OFF",
                    ],

                    [
                      "Auto promotion",
                      brain?.intelligence
                        ?.neural
                        ?.automatic_promotion
                        ? "ON"
                        : "OFF",
                    ],

                    [
                      "Pure OMI champion",
                      brain?.intelligence
                        ?.neural
                        ?.pure_omi_champion_protected
                        ? "PROTECTED"
                        : "CHECK",
                    ],
                  ].map(
                    ([label, value]) => (
                      <div
                        key={label}
                        className="
                          flex
                          items-center
                          justify-between
                          border-b
                          border-slate-800/70
                          pb-2
                          text-xs
                          last:border-b-0
                        "
                      >
                        <span
                          className="
                            text-slate-500
                          "
                        >
                          {label}
                        </span>

                        <span
                          className="
                            font-semibold
                            text-slate-300
                          "
                        >
                          {value}
                        </span>
                      </div>
                    ),
                  )
                }
              </div>
            </div>
          </div>
        </section>


'''

        page_text = (
            page_text[:emergency_index]
            + panel
            + page_text[emergency_index:]
        )

        PAGE.write_text(
            page_text,
            encoding="utf-8",
        )

        print(
            "[OK] Experience Intelligence panel added"
        )

    else:

        print(
            "[OK] Experience Intelligence panel already present"
        )


    # ================================================================
    # 3. PRODUCTION BUILD
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
            "Frontend production build failed"
        )

    print()
    print(
        "[PASS] Next.js production build"
    )


except Exception as error:

    print()
    print("=" * 100)
    print("FINAL OMI BRAIN UI FAILED")
    print("=" * 100)
    print(error)

    shutil.copy2(
        api_backup,
        API,
    )

    shutil.copy2(
        page_backup,
        PAGE,
    )

    print()
    print(
        "Automatic rollback : COMPLETE"
    )

    sys.exit(1)


print()
print("=" * 100)
print("OMI BRAIN — FINAL SCIENTIST UI COMPLETE")
print("=" * 100)
print("Live OMI visualization    : PRESERVED")
print("Experience Intelligence   : ADDED")
print("GOOD/BAD/Neutral          : REAL BACKEND DATA")
print("Neural stage              : REAL BACKEND DATA")
print("Research progress         : REAL BACKEND DATA")
print("Candidate status          : REAL BACKEND DATA")
print("Memory advisory           : DISPLAYED")
print("Fake improvement          : NONE")
print("Emergency Control         : PRESERVED")
print("Password verification     : PRESERVED")
print("Optional reason           : PRESERVED")
print("Responsive layout         : ENABLED")
print("Production build          : PASS")
print("=" * 100)
