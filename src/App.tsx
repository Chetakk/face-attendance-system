import { useState } from 'react';
import { UserPlus, CheckCircle, BarChart3 } from 'lucide-react';
import UserRegistration from './components/UserRegistration';
import AttendanceMarker from './components/AttendanceMarker';
import AttendanceDashboard from './components/AttendanceDashboard';

type Tab = 'register' | 'attendance' | 'dashboard';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('attendance');

  const tabs = [
    { id: 'register' as Tab, label: 'Register User', icon: UserPlus },
    { id: 'attendance' as Tab, label: 'Mark Attendance', icon: CheckCircle },
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Face Recognition Attendance System
          </h1>
          <p className="text-gray-600">
            Secure and automated attendance tracking using facial recognition technology
          </p>
        </header>

        <div className="mb-6">
          <nav className="flex gap-2 bg-white rounded-lg shadow-sm p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <main>
          {activeTab === 'register' && <UserRegistration />}
          {activeTab === 'attendance' && <AttendanceMarker />}
          {activeTab === 'dashboard' && <AttendanceDashboard />}
        </main>

        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>Powered by Face-API.js and Supabase</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
