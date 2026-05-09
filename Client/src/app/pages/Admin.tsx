import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router';
import { Users, UserCheck, TrendingUp, DollarSign, Activity, BarChart3, Coins, Calendar } from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  email: string;
  isPremium: boolean;
  tokensUsed: number;
  joinedDate: string;
  lastActive: string;
}

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (!user.isAdmin) {
      navigate('/');
    }
  }, [user, navigate]);

  // Mock data - in production, this would come from your backend
  const mockUsers: UserData[] = [
    {
      id: '1',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      isPremium: true,
      tokensUsed: 125000,
      joinedDate: '2026-03-15',
      lastActive: '2026-05-09',
    },
    {
      id: '2',
      name: 'Bob Smith',
      email: 'bob@company.com',
      isPremium: true,
      tokensUsed: 89000,
      joinedDate: '2026-04-02',
      lastActive: '2026-05-08',
    },
    {
      id: '3',
      name: 'Carol Williams',
      email: 'carol@startup.io',
      isPremium: false,
      tokensUsed: 3200,
      joinedDate: '2026-05-01',
      lastActive: '2026-05-09',
    },
    {
      id: '4',
      name: 'David Chen',
      email: 'david@tech.com',
      isPremium: true,
      tokensUsed: 210000,
      joinedDate: '2026-02-20',
      lastActive: '2026-05-09',
    },
    {
      id: '5',
      name: 'Emma Davis',
      email: 'emma@design.co',
      isPremium: false,
      tokensUsed: 1800,
      joinedDate: '2026-05-05',
      lastActive: '2026-05-07',
    },
    {
      id: '6',
      name: 'Frank Miller',
      email: 'frank@dev.net',
      isPremium: true,
      tokensUsed: 156000,
      joinedDate: '2026-03-28',
      lastActive: '2026-05-09',
    },
  ];

  const totalUsers = mockUsers.length;
  const premiumUsers = mockUsers.filter((u) => u.isPremium).length;
  const totalTokensUsed = mockUsers.reduce((sum, u) => sum + u.tokensUsed, 0);
  const avgTokensPerUser = Math.round(totalTokensUsed / totalUsers);

  const revenueEstimate = premiumUsers * 25; // Assuming average $25 per premium user

  const weeklyGrowth = [
    { week: 'Week 1', users: 12, premium: 3 },
    { week: 'Week 2', users: 18, premium: 5 },
    { week: 'Week 3', users: 25, premium: 8 },
    { week: 'Week 4', users: 32, premium: 12 },
  ];

  if (!user?.isAdmin) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
          <p className="text-slate-600">Monitor user activity and system metrics</p>
        </div>

        {/* Time Range Selector */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeRange === 'week'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            Last Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeRange === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            Last Month
          </button>
          <button
            onClick={() => setTimeRange('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeRange === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            All Time
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-green-600 text-sm font-medium">+12%</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{totalUsers}</div>
            <div className="text-sm text-slate-600">Total Users</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-green-600 text-sm font-medium">+24%</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{premiumUsers}</div>
            <div className="text-sm text-slate-600">Premium Users</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-green-600 text-sm font-medium">+18%</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">${revenueEstimate}</div>
            <div className="text-sm text-slate-600">Monthly Revenue</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Coins className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-green-600 text-sm font-medium">+32%</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {(totalTokensUsed / 1000).toFixed(0)}K
            </div>
            <div className="text-sm text-slate-600">Tokens Used</div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Growth Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">User Growth</h2>
            </div>

            <div className="space-y-4">
              {weeklyGrowth.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">{item.week}</span>
                    <span className="text-sm font-medium text-slate-900">{item.users} users</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${(item.users / 40) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Premium Conversion */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Premium Conversion</h2>
            </div>

            <div className="mb-6">
              <div className="text-4xl font-bold text-slate-900 mb-2">
                {Math.round((premiumUsers / totalUsers) * 100)}%
              </div>
              <div className="text-sm text-slate-600">Conversion Rate</div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">Free Users</span>
                  <span className="text-sm font-medium text-slate-900">
                    {totalUsers - premiumUsers}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-slate-400 h-2 rounded-full"
                    style={{ width: `${((totalUsers - premiumUsers) / totalUsers) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">Premium Users</span>
                  <span className="text-sm font-medium text-slate-900">{premiumUsers}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${(premiumUsers / totalUsers) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Token Usage Stats</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {totalTokensUsed.toLocaleString()}
              </div>
              <div className="text-sm text-slate-600">Total Tokens Used</div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {avgTokensPerUser.toLocaleString()}
              </div>
              <div className="text-sm text-slate-600">Avg per User</div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {Math.round((totalTokensUsed / 30000) * 100)}%
              </div>
              <div className="text-sm text-slate-600">Daily Limit Usage</div>
            </div>
          </div>
        </div>

        {/* User Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">User Details</h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Tokens Used
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Last Active
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {mockUsers.map((userData) => (
                  <tr key={userData.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-slate-900">{userData.name}</div>
                        <div className="text-sm text-slate-500">{userData.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {userData.isPremium ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Premium
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                          Free
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {userData.tokensUsed.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(userData.joinedDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(userData.lastActive).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
