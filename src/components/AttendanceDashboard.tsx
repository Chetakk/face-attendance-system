import { useEffect, useState } from 'react';
import { Calendar, Users, TrendingUp } from 'lucide-react';
import { supabase, AttendanceRecord } from '../lib/supabase';

export default function AttendanceDashboard() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalToday: 0,
    totalUsers: 0,
    averageConfidence: 0,
  });

  useEffect(() => {
    fetchRecords();
    fetchStats();
  }, []);

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .select(`
          *,
          users (
            name,
            email
          )
        `)
        .order('check_in_time', { ascending: false })
        .limit(50);

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: todayRecords, error: todayError } = await supabase
        .from('attendance_records')
        .select('face_match_confidence')
        .gte('check_in_time', today.toISOString());

      if (todayError) throw todayError;

      const { count: userCount, error: userError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      if (userError) throw userError;

      const avgConfidence =
        todayRecords && todayRecords.length > 0
          ? todayRecords.reduce((sum, r) => sum + Number(r.face_match_confidence), 0) /
            todayRecords.length
          : 0;

      setStats({
        totalToday: todayRecords?.length || 0,
        totalUsers: userCount || 0,
        averageConfidence: avgConfidence,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Attendance Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="text-blue-600" size={24} />
            <h3 className="font-semibold text-gray-700">Today's Attendance</h3>
          </div>
          <p className="text-3xl font-bold text-blue-600">{stats.totalToday}</p>
        </div>

        <div className="bg-green-50 rounded-lg p-6 border border-green-100">
          <div className="flex items-center gap-3 mb-2">
            <Users className="text-green-600" size={24} />
            <h3 className="font-semibold text-gray-700">Total Users</h3>
          </div>
          <p className="text-3xl font-bold text-green-600">{stats.totalUsers}</p>
        </div>

        <div className="bg-orange-50 rounded-lg p-6 border border-orange-100">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-orange-600" size={24} />
            <h3 className="font-semibold text-gray-700">Avg Confidence</h3>
          </div>
          <p className="text-3xl font-bold text-orange-600">
            {stats.averageConfidence.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check-in Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Confidence
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    Loading records...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    No attendance records found
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {record.users?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.users?.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(record.check_in_time)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {Number(record.face_match_confidence).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
