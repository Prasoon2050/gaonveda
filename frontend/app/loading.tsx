export default function Loading() {
  return (
    <div className="gaonveda-loader-overlay">
      <div className="gaonveda-top-bar" />
      
      {/* Background ornaments matching the page design patterns */}
      <div className="gaonveda-loader-ornament gaonveda-loader-ornament-left" aria-hidden="true">
        <img src="/leaf-ornament.svg" alt="" />
      </div>
      <div className="gaonveda-loader-ornament gaonveda-loader-ornament-right" aria-hidden="true">
        <img src="/leaf-ornament.svg" alt="" />
      </div>
      
      <div className="gaonveda-loader-container">
        <div className="gaonveda-logo-icon-wrapper">
          <img src="/logo.png" alt="Gaonveda Logo" className="gaonveda-center-logo" />
          <div className="gaonveda-spinner-circle" />
        </div>
        <div className="gaonveda-loader-brand">
          <h2 className="gaonveda-loader-title">GAONVEDA</h2>
          <div className="gaonveda-loader-divider">
            <span className="gaonveda-loader-dot" />
          </div>
          <p className="gaonveda-loader-subtitle">Nurturing Authenticity</p>
        </div>
      </div>
    </div>
  );
}
