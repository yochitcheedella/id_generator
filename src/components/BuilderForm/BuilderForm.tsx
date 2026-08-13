// BuilderForm — Name / Role / Secondary fields (Format B only)
import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { validateName, validateRole, validateSecondary } from '../../lib/validation';
import './BuilderForm.css';

export interface BuilderFormData {
  name: string;
  role: string;
  secondary: string;
}

interface BuilderFormProps {
  data: BuilderFormData;
  onChange: (data: BuilderFormData) => void;
}

export function BuilderForm({ data, onChange }: BuilderFormProps) {
  const [touched, setTouched] = useState({ name: false, role: false, secondary: false });

  const nameError = touched.name ? validateName(data.name).message : undefined;
  const roleError = touched.role ? validateRole(data.role).message : undefined;
  const secError = touched.secondary ? validateSecondary(data.secondary).message : undefined;

  const update = (field: keyof BuilderFormData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const blur = (field: keyof typeof touched) => {
    setTouched((t) => ({ ...t, [field]: true }));
  };

  return (
    <div className="builder-form animate-fadeIn" role="group" aria-label="Builder ID card details">
      <h3 className="builder-form__heading">Your details</h3>

      <div className="builder-form__fields">
        {/* Name */}
        <div className="form-group">
          <label htmlFor="builder-name" className="form-label required">
            Name
          </label>
          <input
            id="builder-name"
            type="text"
            className={`form-input ${nameError ? 'error' : ''}`}
            placeholder="Satoshi Nakamoto"
            value={data.name}
            onChange={(e) => update('name', e.target.value)}
            onBlur={() => blur('name')}
            maxLength={60}
            autoComplete="name"
            aria-required="true"
            aria-describedby={nameError ? 'name-error' : undefined}
          />
          {nameError && (
            <span id="name-error" className="form-error" role="alert">
              <AlertCircle size={12} />
              {nameError}
            </span>
          )}
        </div>

        {/* Role / Stack */}
        <div className="form-group">
          <label htmlFor="builder-role" className="form-label required">
            Role / Stack
          </label>
          <input
            id="builder-role"
            type="text"
            className={`form-input ${roleError ? 'error' : ''}`}
            placeholder="Full-stack · Rust · Solana"
            value={data.role}
            onChange={(e) => update('role', e.target.value)}
            onBlur={() => blur('role')}
            maxLength={80}
            aria-required="true"
            aria-describedby={roleError ? 'role-error' : 'role-hint'}
          />
          {roleError ? (
            <span id="role-error" className="form-error" role="alert">
              <AlertCircle size={12} />
              {roleError}
            </span>
          ) : (
            <span id="role-hint" className="form-hint">Your stack, title, or what you're building</span>
          )}
        </div>

        {/* Secondary (optional) */}
        <div className="form-group">
          <label htmlFor="builder-secondary" className="form-label">
            Secondary <span className="builder-form__optional">(optional)</span>
          </label>
          <input
            id="builder-secondary"
            type="text"
            className={`form-input ${secError ? 'error' : ''}`}
            placeholder="@handle · company · project"
            value={data.secondary}
            onChange={(e) => update('secondary', e.target.value)}
            onBlur={() => blur('secondary')}
            maxLength={80}
            aria-describedby={secError ? 'sec-error' : 'sec-hint'}
          />
          {secError ? (
            <span id="sec-error" className="form-error" role="alert">
              <AlertCircle size={12} />
              {secError}
            </span>
          ) : (
            <span id="sec-hint" className="form-hint">Twitter handle, company, or project name</span>
          )}
        </div>
      </div>
    </div>
  );
}

/** Check if form has all required valid fields */
export function isBuilderFormValid(data: BuilderFormData): boolean {
  return (
    validateName(data.name).valid &&
    validateRole(data.role).valid &&
    validateSecondary(data.secondary).valid
  );
}
