import { RepoPicker } from '@/components/RepoPicker';
import { WorkflowShell } from '@/components/WorkflowShell';

export default function HomePage() {
  return (
    <div className="layout-grid">
      <RepoPicker />
      <WorkflowShell />
    </div>
  );
}
