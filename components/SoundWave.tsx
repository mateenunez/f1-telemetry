interface SoundWaveProps {
  teamColor: string | undefined;
  width: number | undefined;
}

export default function SoundWave({ teamColor, width }: SoundWaveProps) {
  return (
    <div className="w-4">
      <div
        className="Sound"
        style={
          {
            "--width": `${width}rem`,
          } as React.CSSProperties
        }
      >
        <span style={{ background: "#" + teamColor }}></span>
        <span style={{ background: "#" + teamColor }}></span>
        <span style={{ background: "#" + teamColor }}></span>
        <span style={{ background: "#" + teamColor }}></span>
        <span style={{ background: "#" + teamColor }}></span>
        <span style={{ background: "#" + teamColor }}></span>
        <span style={{ background: "#" + teamColor }}></span>
        <span style={{ background: "#" + teamColor }}></span>
        <span style={{ background: "#" + teamColor }}></span>
        <span style={{ background: "#" + teamColor }}></span>
      </div>
    </div>
  );
}
