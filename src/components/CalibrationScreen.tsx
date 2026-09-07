type CalibrationScreenProps = {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onContinueFallback: () => void;
};

export function CalibrationScreen({ videoRef, onContinueFallback }: CalibrationScreenProps) {
  return (
    <main className="terminal-shell calibration-shell">
      <div className="atmosphere" aria-hidden="true" />
      <div className="scanlines" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />

      <header className="hud-corner hud-corner--top-left">
        <span className="hud-kicker">OPTICAL SENSOR / CALIBRATION</span>
        <strong>LAST HORIZON</strong>
      </header>

      <div className="hud-corner hud-corner--top-right" aria-label="System status">
        <span className="status-light status-light--live" />
        <span>OPTICAL SENSOR <b className="status-live">ONLINE</b></span>
        <span>CAMERA DATA PROCESSED LOCALLY</span>
      </div>

      <section className="calibration-panel" aria-labelledby="calibration-title">
        <div className="calibration-panel__header">
          <span className="boot-panel__eyebrow">PHASE 0.5 // SENSOR CHECK</span>
          <span className="calibration-panel__code">CAL-001</span>
        </div>
        <h1 id="calibration-title">Calibrating optical tracking<span className="cursor">_</span></h1>
        <p className="boot-panel__subline">Raise one hand into frame. Hold position until the tracking lock confirms.</p>

        <div className="camera-stage">
          <video ref={videoRef} autoPlay playsInline muted className="camera-stage__video" />
          <div className="reticle reticle--top-left" />
          <div className="reticle reticle--top-right" />
          <div className="reticle reticle--bottom-left" />
          <div className="reticle reticle--bottom-right" />
          <span className="camera-stage__label">LIVE / MIRRORED / LOCAL</span>
        </div>

        <div className="calibration-readout">
          <span><i className="status-dot" /> AWAITING LANDMARK INPUT</span>
          <span>HAND COUNT <b>--</b></span>
          <span>CONFIDENCE <b>--</b></span>
        </div>

        <button className="text-button" type="button" onClick={onContinueFallback}>
          <span className="button-bracket">[</span> CONTINUE WITHOUT CAMERA <span className="button-bracket">]</span>
        </button>
      </section>

      <footer className="system-bar">
        <span>LH-01 / CALIBRATION</span>
        <span>VISION PIPELINE STANDBY</span>
        <span>AWAITING HAND</span>
      </footer>
    </main>
  );
}
