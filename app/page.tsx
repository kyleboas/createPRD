import { ActionBar } from '@/components/ActionBar';
import { ChatPanel } from '@/components/ChatPanel';
import { PreviewTabs } from '@/components/PreviewTabs';
import { RepoPicker } from '@/components/RepoPicker';

export default function HomePage() {
  return (
    <div className="layout-grid">
      <RepoPicker />
      <PreviewTabs />
      <ChatPanel />
      <ActionBar />
    </div>
  );
}
