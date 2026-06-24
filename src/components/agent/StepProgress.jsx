export default function StepProgress({ steps = [], currentStep = 0, completedSteps = [] }) {
  return (
    <div className="w-full">
      {/* Desktop */}
      <div className="hidden md:flex items-center justify-between relative">
        {steps.map((step, i) => {
          const isActive = i === currentStep
          const isCompleted = completedSteps.includes(i)

          return (
            <div key={i} className="flex-1 flex flex-col items-center relative">
              {/* Connecting Line */}
              {i < steps.length - 1 && (
                <div className="absolute top-4 left-[50%] right-0 w-full h-[2px]">
                  <div className={`h-full transition-colors duration-300 ${
                    isCompleted ? "bg-green-500" : "bg-surface-container-high"
                  }`} />
                </div>
              )}

              {/* Circle */}
              <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                isCompleted ? "step-completed" : isActive ? "step-active" : "step-pending"
              }`}>
                {isCompleted ? (
                  <span className="material-symbols-outlined text-[18px]">check</span>
                ) : (
                  i + 1
                )}
              </div>

              {/* Label */}
              <span className={`mt-2 text-xs font-medium text-center transition-colors ${
                isActive ? "text-accent font-semibold" : isCompleted ? "text-green-600" : "text-on-surface-variant"
              }`}>
                {step}
              </span>
            </div>
          )
        })}
      </div>

      {/* Mobile */}
      <div className="md:hidden flex items-center gap-3 px-1">
        <div className="step-active w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
          {currentStep + 1}
        </div>
        <div>
          <p className="text-sm font-semibold text-primary">{steps[currentStep]}</p>
          <p className="text-xs text-on-surface-variant">Step {currentStep + 1} of {steps.length}</p>
        </div>
        {/* Progress bar */}
        <div className="flex-1 h-1.5 bg-surface-container-high rounded-full overflow-hidden ml-2">
          <div
            className="h-full bg-accent rounded-full transition-all duration-500"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
