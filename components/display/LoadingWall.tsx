export default function LoadingWall() {
  return (
    <div className="flex items-center justify-center">
      <div className="aspect-square w-[60vw] max-w-[440px] animate-pulse sm:w-[50vw] sm:max-w-[480px] lg:w-[40vw] lg:max-w-[560px]">
        <div className="h-full w-full rounded-2xl bg-white/10" />
      </div>
    </div>
  );
}
