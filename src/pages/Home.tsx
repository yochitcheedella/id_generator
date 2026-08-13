// Home page — full generator flow (state machine view)
import { useState, useCallback, useRef, useEffect } from 'react';
import { Zap } from 'lucide-react';
import { Hero } from '../components/Hero/Hero';
import { FormatSelector } from '../components/FormatSelector/FormatSelector';
import { UploadDropzone } from '../components/UploadDropzone/UploadDropzone';
import { BuilderForm, isBuilderFormValid, type BuilderFormData } from '../components/BuilderForm/BuilderForm';
import { ResultPreview } from '../components/ResultPreview/ResultPreview';
import { ErrorState } from '../components/ErrorState/ErrorState';
import { ToastContainer, useToast } from '../components/Toast/Toast';
import { useImageFile } from '../hooks/useImageFile';
import { useGenerator, type Format } from '../hooks/useGenerator';
import './Home.css';

const INITIAL_FORM: BuilderFormData = { name: '', role: '', secondary: '' };

export function Home() {
  const [format, setFormat] = useState<Format | null>(null);
  const [formData, setFormData] = useState<BuilderFormData>(INITIAL_FORM);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);
  const generateRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to step 2 when a format is selected
  const handleFormatChange = useCallback((f: Format | null) => {
    setFormat(f);
    if (f) {
      // Small delay so the step renders before we scroll to it
      setTimeout(() => {
        step2Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    }
  }, []);

  const { state: fileState, processFile, reset: resetFile } = useImageFile();
  const { state: genState, generate, download, reset: resetGen } = useGenerator();
  const { toasts, show: showToast, dismiss: dismissToast } = useToast();

  // Auto-scroll to next step after photo is processed
  useEffect(() => {
    if (fileState.status !== 'ready') return;
    setTimeout(() => {
      // For builder format scroll to step 3 (details form), for pfp scroll to generate button
      const target = format === 'builder' ? step3Ref.current : generateRef.current;
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  }, [fileState.status, format]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleFile = useCallback((file: File) => {
    resetGen();
    processFile(file);
  }, [processFile, resetGen]);

  const handleGenerate = useCallback(() => {
    if (!format || fileState.status !== 'ready') return;
    generate(format, fileState.image, {
      name: formData.name,
      role: formData.role,
      secondary: formData.secondary,
    });
  }, [format, fileState, generate, formData]);

  const handleCreateAnother = useCallback(() => {
    resetGen();
    resetFile();
    setFormData(INITIAL_FORM);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [resetGen, resetFile]);

  // ── Derived state ────────────────────────────────────────────────────────────

  const fileReady = fileState.status === 'ready';
  const fileLoading = fileState.status === 'loading';
  const fileError = fileState.status === 'error';
  const generating = genState.status === 'generating';
  const genReady = genState.status === 'ready';
  const genError = genState.status === 'error';

  const canGenerate = (() => {
    if (!format || !fileReady) return false;
    if (format === 'builder') return isBuilderFormValid(formData);
    return true;
  })();

  // ── Result screen ─────────────────────────────────────────────────────────────
  if (genReady) {
    return (
      <>
        <div className="home">
          <div className="container home__result-container">
            <div className="home__section-header">
              <h2 className="home__section-title">Your graphic is ready!</h2>
              <p className="home__section-sub">Download it or share directly to X</p>
            </div>
            <ResultPreview
              asset={genState.asset}
              format={format!}
              name={formData.name}
              role={formData.role}
              onDownload={download}
              onCreateAnother={handleCreateAnother}
              onToast={showToast}
            />
          </div>
        </div>
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  // ── Main generator flow ──────────────────────────────────────────────────────
  return (
    <>
      <div className="home">
        <Hero />

        <div className="container home__generator">
          {/* Step 1: Format */}
          <div className="home__step">
            <div className="home__step-number">1</div>
            <div className="home__step-content">
              <FormatSelector selected={format} onChange={handleFormatChange} />
            </div>
          </div>

          {/* Step 2: Upload */}
          {format && (
            <div ref={step2Ref} className="home__step animate-fadeIn">
              <div className="home__step-number">2</div>
              <div className="home__step-content">
                <h2 className="home__step-heading">Upload your photo</h2>
                <UploadDropzone
                  onFile={handleFile}
                  isLoading={fileLoading}
                  currentFile={fileReady ? fileState.file : null}
                  onReplace={resetFile}
                />
                {fileError && (
                  <ErrorState
                    title="Photo error"
                    message={fileState.error}
                    onRetry={() => resetFile()}
                    retryLabel="Choose a different photo"
                  />
                )}
              </div>
            </div>
          )}

          {/* Step 3: Builder form (format B only) */}
          {format === 'builder' && fileReady && (
            <div ref={step3Ref} className="home__step animate-fadeIn">
              <div className="home__step-number">3</div>
              <div className="home__step-content">
                <BuilderForm data={formData} onChange={setFormData} />
              </div>
            </div>
          )}

          {/* Generate button */}
          {format && fileReady && (
            <div ref={generateRef} className="home__generate animate-fadeIn">
              {genError && (
                <ErrorState
                  title="Generation failed"
                  message={genState.error}
                  onRetry={handleGenerate}
                  onBack={handleCreateAnother}
                />
              )}
              {!genError && (
                <button
                  className="btn btn-primary btn-lg home__btn-generate"
                  onClick={handleGenerate}
                  disabled={!canGenerate || generating}
                  id="generate-btn"
                  aria-label={generating ? 'Generating your graphic…' : 'Generate graphic'}
                >
                  {generating ? (
                    <>
                      <div className="spinner" aria-hidden="true" />
                      Generating…
                    </>
                  ) : (
                    <>
                      <Zap size={20} aria-hidden="true" />
                      Generate{format === 'builder' ? ' ID Card' : ' PFP Frame'}
                    </>
                  )}
                </button>
              )}
              {!canGenerate && !genError && !generating && format === 'builder' && (
                <p className="home__generate-hint">
                  Fill in Name and Role to enable generation
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
