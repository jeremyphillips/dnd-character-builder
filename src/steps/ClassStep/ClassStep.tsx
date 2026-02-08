import { useCharacterBuilder } from '@/characterBuilder'
import { classes } from '@/data'
import { 
  getOptions, 
  getClassDefinitions, 
  getSubclassUnlockLevel, 
  meetsClassRequirements 
} from '@/helpers'
import { ButtonGroup } from '@/components/elements'

const ClassStep = () => {
  const {
    state,
    allocatedLevels,
    setActiveClassIndex,
    setClassId,
    addClass,
    updateClassLevel,
    removeClass,
    updateClassDefinition,
    allocateRemainingLevels
  } = useCharacterBuilder()  

  const {
    step,
    edition,
    campaign,
    classes: selectedClasses,
    activeClassIndex,
    totalLevel
  } = state

  const activeClass =
    typeof activeClassIndex === 'number'
      ? selectedClasses[activeClassIndex]
      : null

  const remainingLevels = totalLevel - allocatedLevels

  /* ---------- Primary class options ---------- */
  const allowedClassIds = getOptions('classes', edition, campaign)

  const classOptions = allowedClassIds
    .map(id => classes.find(c => c.id === id))
    .filter(Boolean)
    .map(cls => {
      const { allowed } = meetsClassRequirements(cls!, state)
      return {
        id: cls!.id,
        label: cls!.name,
        disabled: !allowed
      }
    })

  const primaryClassSelected = Boolean(selectedClasses[0]?.classId)

  return (
    <div>
      {/* Header / allocation guidance */}
      <header>
        <h2>Choose {step.name}</h2>
        <p>
          Allocate your {totalLevel} total level{totalLevel > 1 ? 's' : ''} across one or more classes.
        </p>
        <p>
          <strong>Levels Allocated:</strong> {allocatedLevels} / {totalLevel}
          {remainingLevels > 0 && 
            <>
              <br />
              <small className="hint">
                {remainingLevels} level{remainingLevels > 1 ? 's' : ''} remaining
              </small>
            </>  
          }
        </p>
        {/* {remainingLevels > 0 && (
          <p className="hint">
            You have {remainingLevels} unallocated level{remainingLevels > 1 ? 's' : ''}.
            Allocate them before continuing.
          </p>
        )} */}
        {remainingLevels === 0 && <p className="success">All levels allocated ✅</p>}
      </header>

      <div className="class-card-wrapper">
        {selectedClasses.map((cls, index) => {
          const isActive = activeClass && index === activeClassIndex
          const isPrimary = index === 0

          const subclassUnlockLevel = getSubclassUnlockLevel(cls.classId, edition)
          const canChooseSubclass =
            cls.classId &&
            subclassUnlockLevel &&
            cls.level >= subclassUnlockLevel

          const definitions = canChooseSubclass
            ? getClassDefinitions(cls.classId, edition, cls.level)
            : []

          const subclassOptions = definitions.flatMap(d =>
            d.options.map(opt => ({
              id: opt.id,
              label: opt.name
            }))
          )

          return (
            <div
              key={index}
              className={`class-card ${isActive ? 'is-active' : ''}`}
            >
              {/* ---------- Card header (always visible) ---------- */}
              <header className="class-card-header">
                <small>{isPrimary ? 'Primary Class' : 'Secondary Class'}</small>

                <div className="class-title-row">
                  <h4 className="mt-0">
                    {cls.classId || 'Choose a class'}
                    {cls.classDefinitionId && ` — ${cls.classDefinitionId}`}
                  </h4>

                  <span className="level">
                    Level {cls.level}
                  </span>
                </div>

                <div className="class-card-actions">
                  {!isActive && (
                    <button
                      className="btn-size-sm btn-theme-secondary"
                      onClick={() => setActiveClassIndex(index)}
                    >
                      Edit
                    </button>
                  )}

                  {!isActive && (
                    <button
                      className="btn-size-sm btn-theme-secondary"
                      onClick={() => removeClass(index)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </header>

              {/* ---------- Expanded editor (active only) ---------- */}
              {isActive && (
                <div className="class-card-body">
                  {/* Class selection */}
                  <ButtonGroup
                    options={classOptions.map(opt => {
                      const primaryClassId = selectedClasses[0]?.classId
                      const disabled =
                        index !== 0 && opt.id === primaryClassId

                      return { ...opt, disabled }
                    })}
                    value={cls.classId}
                    onChange={id => setClassId(id)}
                    autoSelectSingle
                  />

                  {/* Level controls */}
                  <div className="level-controls">
                    <button
                      type="button"
                      disabled={cls.level <= 1}
                      className='btn-size-sm btn-theme-secondary'
                      onClick={() =>
                        updateClassLevel(index, cls.level - 1)
                      }
                    >
                      −
                    </button>

                    <span>Level {cls.level}</span>

                    <button
                      type="button"
                      disabled={remainingLevels <= 0}
                      className='btn-size-sm btn-theme-secondary'
                      onClick={() =>
                        updateClassLevel(index, cls.level + 1)
                      }
                    >
                      +
                    </button>
                    <a href="#" onClick={e => { e.preventDefault(); allocateRemainingLevels() }}>
                      Allocate all remaining levels
                    </a>
                  </div>

                  {/* Subclass */}
                  {subclassOptions.length > 0 && (
                    <>
                      <hr />
                      <h5>Subclass</h5>
                      <ButtonGroup
                        options={subclassOptions}
                        value={cls.classDefinitionId}
                        onChange={id =>
                          updateClassDefinition(index, id)
                        }
                        autoSelectSingle
                        size="sm"
                      />
                    </>
                  )}

                  {!canChooseSubclass && cls.classId && (
                    <p className="hint">
                      Subclass unlocks at level {subclassUnlockLevel}
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Add/Remove class */}
      <div className="class-actions">
        {primaryClassSelected &&
          selectedClasses.length < 2 &&
          selectedClasses.length < totalLevel && (

          <button
            type="button"
            onClick={addClass}
            className='btn-theme-secondary'
            //disabled={selectedClasses.length >= 2 || remainingLevels === 0}
          >
            + Add another class
          </button>
        )}
      </div>
    </div>
  )
}

export default ClassStep
