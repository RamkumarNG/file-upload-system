import { File } from './components/File';

function App() {

  return (
    <div className="min-h-screen bg-gray-100">
      <>
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Abnormal Security - File Hub</h1>
            <p className="mt-1 text-sm text-gray-500">
              File management system
            </p>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <File/>
        </main>
        <footer className="bg-white shadow mt-8">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-gray-500">
              © 2024 File Hub. All rights reserved.
            </p>
          </div>
        </footer>
      </>
      <>
        <div
          key="popover-portal-container"
          className="popover-portal-container"
          id="popover-portal-container"
        />
      </>
    </div>
  );
}

export default App;
