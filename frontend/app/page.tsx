export default function Home() {
  return (
    <main className="p-4">
      <h1>Sleep-Fit-Stats</h1>

      <section className="card sleep-section mt-4">
        <h2>Sleep Analytics</h2>
        <p>Track your sleep patterns and quality metrics.</p>
        <button className="button button-secondary mt-2">View Sleep Data</button>
      </section>

      <section className="card fitness-section mt-4">
        <h2>Fitness Tracking</h2>
        <p>Monitor your workout progress and activity levels.</p>
        <button className="button button-primary mt-2">View Fitness Data</button>
      </section>

      <div className="mt-6">
        <h3>Color Palette Preview</h3>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div
            className="color-sample"
            style={{ backgroundColor: 'var(--night-blue)', height: '40px', borderRadius: '4px' }}
          >
            <span>Night Blue (--night-blue)</span>
          </div>
          <div
            className="color-sample"
            style={{ backgroundColor: 'var(--active-green)', height: '40px', borderRadius: '4px' }}
          >
            <span style={{ color: 'var(--night-blue)' }}>Active Green (--active-green)</span>
          </div>
          <div
            className="color-sample"
            style={{ backgroundColor: 'var(--slate-blue)', height: '40px', borderRadius: '4px' }}
          >
            <span>Slate Blue (--slate-blue)</span>
          </div>
          <div
            className="color-sample"
            style={{ backgroundColor: 'var(--deep-slate)', height: '40px', borderRadius: '4px' }}
          >
            <span>Deep Slate (--deep-slate)</span>
          </div>
          <div
            className="color-sample"
            style={{ backgroundColor: 'var(--alert-red)', height: '40px', borderRadius: '4px' }}
          >
            <span>Alert Red (--alert-red)</span>
          </div>
          <div
            className="color-sample"
            style={{ backgroundColor: 'var(--forest-green)', height: '40px', borderRadius: '4px' }}
          >
            <span>Forest Green (--forest-green)</span>
          </div>
        </div>
      </div>
    </main>
  );
}
