// FormatSelector — Card A (PFP) + Card B (Builder ID)
import { Check } from 'lucide-react';
import type { Format } from '../../hooks/useGenerator';
import './FormatSelector.css';

interface FormatSelectorProps {
  selected: Format | null;
  onChange: (format: Format) => void;
}

const formats: Array<{
  id: Format;
  title: string;
  description: string;
  badge: string;
  preview: React.ReactNode;
  dimensions: string;
}> = [
  {
    id: 'pfp',
    title: 'PFP Frame',
    description: 'Add the official HH Goa 2026 frame to your profile photo — perfect as your X/Twitter PFP.',
    badge: 'Format A',
    dimensions: '1080 × 1080 px',
    preview: <PfpPreview />,
  },
  {
    id: 'builder',
    title: 'Builder ID Card',
    description: 'Generate a social-media-ready Builder ID card with your photo, name, and stack.',
    badge: 'Format B',
    dimensions: '1200 × 1500 px',
    preview: <BuilderPreview />,
  },
];

export function FormatSelector({ selected, onChange }: FormatSelectorProps) {
  return (
    <section className="format-selector" aria-label="Choose a format">
      <h2 className="format-selector__heading">
        Choose your format
      </h2>
      <div className="format-selector__grid" role="radiogroup" aria-label="Output format">
        {formats.map((f) => {
          const isSelected = selected === f.id;
          return (
            <button
              key={f.id}
              role="radio"
              aria-checked={isSelected}
              className={`format-card ${isSelected ? 'format-card--selected' : ''}`}
              onClick={() => onChange(f.id)}
              id={`format-${f.id}`}
            >
              <div className="format-card__preview" aria-hidden="true">
                {f.preview}
              </div>
              <div className="format-card__body">
                <div className="format-card__header">
                  <span className="badge badge-coral">{f.badge}</span>
                  {isSelected && (
                    <span className="format-card__check" aria-hidden="true">
                      <Check size={14} strokeWidth={3} />
                    </span>
                  )}
                </div>
                <h3 className="format-card__title">{f.title}</h3>
                <p className="format-card__description">{f.description}</p>
                <span className="format-card__dims">{f.dimensions}</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

// Mini canvas previews
function PfpPreview() {
  return (
    <div className="preview-pfp">
      <div className="preview-pfp__frame">
        <div className="preview-pfp__corner tl" />
        <div className="preview-pfp__corner tr" />
        <div className="preview-pfp__circle">
          <div className="preview-pfp__avatar" />
        </div>
        <div className="preview-pfp__ring" />
        <div className="preview-pfp__label">HH GOA 2026</div>
        <div className="preview-pfp__bar" />
      </div>
    </div>
  );
}

function BuilderPreview() {
  return (
    <div className="preview-builder">
      <div className="preview-builder__card">
        <div className="preview-builder__header-bar" />
        <div className="preview-builder__corner" />
        <div className="preview-builder__body">
          <div className="preview-builder__photo" />
          <div className="preview-builder__text">
            <div className="preview-builder__tag" />
            <div className="preview-builder__name" />
            <div className="preview-builder__role" />
            <div className="preview-builder__role short" />
          </div>
        </div>
        <div className="preview-builder__footer">
          <div className="preview-builder__footer-text" />
          <div className="preview-builder__footer-bar" />
        </div>
      </div>
    </div>
  );
}
