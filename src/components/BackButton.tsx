type BackButtonProps = { onBack: () => void };

export function BackButton({ onBack }: BackButtonProps) {
  return <button className="back-button" type="button" onClick={onBack} aria-label="Go back">← BACK</button>;
}