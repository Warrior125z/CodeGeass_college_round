
import {
  Check,
  Circle,
  LoaderCircle,
  AlertCircle,
  Workflow,
} from 'lucide-react';

import '../styles/WorkflowStatus.css';

export type WorkflowStep = {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
};

type WorkflowStatusProps = {
  title?: string;
  steps: WorkflowStep[];
};

function WorkflowStatus({
  title = 'Workflow progress',
  steps,
}: WorkflowStatusProps) {
  const completedCount = steps.filter(
    (step) => step.status === 'completed'
  ).length;

  const failedCount = steps.filter(
    (step) => step.status === 'failed'
  ).length;

  const activeStep = steps.find(
    (step) => step.status === 'in-progress'
  );

  const allCompleted =
    steps.length > 0 && completedCount === steps.length;

  const progress = steps.length
    ? Math.round((completedCount / steps.length) * 100)
    : 0;

  function getStatusLabel(status: WorkflowStep['status']) {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in-progress':
        return 'In progress';
      case 'failed':
        return 'Failed';
      default:
        return 'Waiting';
    }
  }

  return (
    <section className="workflow-status">
      <header className="workflow-status-header">
        <div className="workflow-status-heading">
          <span className="workflow-status-icon">
            <Workflow size={18} />
          </span>

          <div>
            <h3>{title}</h3>
            <p>
              {allCompleted
                ? 'All steps completed successfully'
                : failedCount > 0
                  ? 'A step needs attention'
                  : activeStep
                    ? activeStep.title
                    : 'Waiting for the next step'}
            </p>
          </div>
        </div>

        <span className="workflow-status-count">
          {completedCount}/{steps.length}
        </span>
      </header>

      <div
        className="workflow-progress-track"
        role="progressbar"
        aria-label="Workflow progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
      >
        <div
          className="workflow-progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="workflow-steps">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`workflow-step workflow-step-${step.status}`}
          >
            <div className="workflow-step-indicator">
              {step.status === 'completed' ? (
                <Check size={14} />
              ) : step.status === 'in-progress' ? (
                <LoaderCircle
                  size={15}
                  className="workflow-step-spinner"
                />
              ) : step.status === 'failed' ? (
                <AlertCircle size={15} />
              ) : (
                <Circle size={13} />
              )}

              {index < steps.length - 1 && (
                <span className="workflow-step-connector" />
              )}
            </div>

            <div className="workflow-step-content">
              <div className="workflow-step-title-row">
                <strong>{step.title}</strong>

                <span className="workflow-step-label">
                  {getStatusLabel(step.status)}
                </span>
              </div>

              {step.description && (
                <p>{step.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default WorkflowStatus;
