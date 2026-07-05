import { LoadingBar } from '@/components/ui/LoadingBar';

export default function UploadProgress({ text, progress }: { text: string; progress: number }) {
  return <LoadingBar text={text} progress={progress} />;
}
