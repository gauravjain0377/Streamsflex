import React from 'react';
import { useVideos } from '../context/VideoContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Eye, Smartphone, Monitor, Tablet, Activity } from 'lucide-react';

const COLORS = ['#6366f1', '#a855f7', '#ec4899'];

const StatsCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-card p-6 rounded-2xl border border-slate-800 shadow-lg">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-white">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${color} bg-opacity-20`}>
        <Icon size={24} className={color.replace('bg-', 'text-')} />
      </div>
    </div>
  </div>
);

export const Admin: React.FC = () => {
  const { videos } = useVideos();

  // Aggregate Data
  const totalViews = videos.reduce((acc, curr) => acc + curr.analytics.views, 0);
  const totalDesktop = videos.reduce((acc, curr) => acc + curr.analytics.devices.desktop, 0);
  const totalMobile = videos.reduce((acc, curr) => acc + curr.analytics.devices.mobile, 0);
  const totalTablet = videos.reduce((acc, curr) => acc + curr.analytics.devices.tablet, 0);

  const deviceData = [
    { name: 'Desktop', value: totalDesktop },
    { name: 'Mobile', value: totalMobile },
    { name: 'Tablet', value: totalTablet },
  ];

  const videoPerformanceData = videos.map(v => ({
    name: v.title.length > 15 ? v.title.substring(0, 15) + '...' : v.title,
    views: v.analytics.views
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-slate-400">Platform analytics and performance metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Views" value={totalViews.toLocaleString()} icon={Eye} color="text-blue-500 bg-blue-500" />
        <StatsCard title="Desktop Users" value={totalDesktop.toLocaleString()} icon={Monitor} color="text-indigo-500 bg-indigo-500" />
        <StatsCard title="Mobile Users" value={totalMobile.toLocaleString()} icon={Smartphone} color="text-pink-500 bg-pink-500" />
        <StatsCard title="Tablet Users" value={totalTablet.toLocaleString()} icon={Tablet} color="text-purple-500 bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Device Distribution Chart */}
        <div className="bg-card p-6 rounded-2xl border border-slate-800 shadow-lg">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <Activity className="mr-2 text-primary" size={20} />
            Device Distribution
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-6 mt-4">
            {deviceData.map((entry, index) => (
              <div key={entry.name} className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index] }}></div>
                <span className="text-sm text-slate-300">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Video Performance Chart */}
        <div className="bg-card p-6 rounded-2xl border border-slate-800 shadow-lg">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <Activity className="mr-2 text-primary" size={20} />
            Top Video Performance
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={videoPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tick={{fill: '#94a3b8'}} />
                <YAxis stroke="#94a3b8" fontSize={12} tick={{fill: '#94a3b8'}} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="views" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Recent Activity Table */}
      <div className="bg-card rounded-2xl border border-slate-800 shadow-lg overflow-hidden">
        <div className="p-6 border-b border-slate-800">
           <h3 className="text-xl font-bold text-white">All Videos Status</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-900 text-xs uppercase font-medium text-slate-300">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Upload Date</th>
                <th className="px-6 py-4 text-right">Size</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {videos.map((video) => (
                <tr key={video._id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{video.title}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4">{new Date(video.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">{(video.size / (1024 * 1024)).toFixed(1)} MB</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};