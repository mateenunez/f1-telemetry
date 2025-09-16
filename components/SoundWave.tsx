interface SoundWaveProps {
  teamColor: string | undefined;
}

export default function SoundWave({ teamColor }: SoundWaveProps) {
  return (
    <div className="w-4 h-4">
      <div className="Sound">
        <span style={{ background: "#" + teamColor }}></span>
        <span style={{ background: "#" + teamColor }}></span>
        <span style={{ background: "#" + teamColor }}></span>
        <span style={{ background: "#" + teamColor }}></span>
        <span style={{ background: "#" + teamColor }}></span>
      </div>
    </div>
  );
}
