import { useState, useEffect } from "react";

// ── Fake live data generator ──────────────────────────────────────────────────
function generateReading(base, variance) {
  return (base + (Math.random() - 0.5) * variance).toFixed(1);
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value, unit, status, icon }) {
  const statusColor =
    status === "normal"  ? "bg-emerald-500" :
    status === "warning" ? "bg-amber-500"   : "bg-red-500";

  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-cyan-500 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-400 text-sm font-medium">{label}</span>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${statusColor} animate-pulse`}></span>
          <span className="text-xl">{icon}</span>
        </div>
      </div>
      <div className="flex items-end gap-1">
        <span className="text-3xl font-bold text-white">{value}</span>
        <span className="text-gray-400 text-sm mb-1">{unit}</span>
      </div>
    </div>
  );
}

function AlertBadge({ type, message, time }) {
  const colors =
    type === "critical" ? "border-red-500 bg-red-500/10 text-red-400" :
    type === "warning"  ? "border-amber-500 bg-amber-500/10 text-amber-400" :
                          "border-emerald-500 bg-emerald-500/10 text-emerald-400";
  const icons =
    type === "critical" ? "🔴" : type === "warning" ? "🟡" : "🟢";

  return (
    <div className={`border rounded-lg p-3 mb-2 ${colors}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>{icons}</span>
          <span className="text-sm font-medium">{message}</span>
        </div>
        <span className="text-xs opacity-60">{time}</span>
      </div>
    </div>
  );
}

function MiniBar({ label, value, max, color }) {
  const pct = Math.min((value / max) * 100, 100).toFixed(0);
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-medium">{value}%</span>
      </div>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        ></div>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [readings, setReadings] = useState({
    voltage:     "415.0",
    current:     "18.5",
    temperature: "72.4",
    pressure:    "3.2",
    rpm:         "1450",
    efficiency:  "87.3",
  });

  const [uptime, setUptime]   = useState(0);
  const [activeTab, setActiveTab] = useState("overview");

  // Live readings update every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setReadings({
        voltage:     generateReading(415, 10),
        current:     generateReading(18.5, 3),
        temperature: generateReading(72, 8),
        pressure:    generateReading(3.2, 0.4),
        rpm:         generateReading(1450, 50),
        efficiency:  generateReading(87, 5),
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Uptime counter
  useEffect(() => {
    const interval = setInterval(() => setUptime(u => u + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (s) => {
    const h = Math.floor(s / 3600).toString().padStart(2, "0");
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${h}:${m}:${sec}`;
  };

  const alerts = [
    { type: "critical", message: "Motor 3 — Temperature exceeds 85°C threshold", time: "2 min ago" },
    { type: "warning",  message: "Generator B — Voltage fluctuation detected",    time: "8 min ago" },
    { type: "warning",  message: "Pump 1 — Pressure trending low",                time: "15 min ago" },
    { type: "info",     message: "Motor 1 — Maintenance completed successfully",  time: "1 hr ago" },
    { type: "info",     message: "System — Daily backup completed",               time: "3 hrs ago" },
  ];

  const machines = [
    { name: "Motor 1",     status: "Running",  load: 78, temp: 68 },
    { name: "Motor 2",     status: "Running",  load: 91, temp: 74 },
    { name: "Motor 3",     status: "Warning",  load: 95, temp: 87 },
    { name: "Generator A", status: "Running",  load: 65, temp: 61 },
    { name: "Generator B", status: "Warning",  load: 72, temp: 69 },
    { name: "Pump 1",      status: "Running",  load: 55, temp: 52 },
    { name: "Pump 2",      status: "Offline",  load: 0,  temp: 24 },
    { name: "Compressor",  status: "Running",  load: 83, temp: 71 },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">

      {/* ── TOP NAV ── */}
      <nav className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <h1 className="text-lg font-bold text-cyan-400">IndustrialIQ</h1>
              <p className="text-xs text-gray-400">Factory Monitoring System</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500 rounded-full px-3 py-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-emerald-400 text-xs font-medium">LIVE</span>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">System Uptime</p>
              <p className="text-sm font-mono font-bold text-cyan-400">{formatUptime(uptime)}</p>
            </div>
            <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-sm font-bold">
              CK
            </div>
          </div>
        </div>
      </nav>

      {/* ── TABS ── */}
      <div className="bg-gray-800 border-b border-gray-700 px-6">
        <div className="max-w-7xl mx-auto flex gap-1">
          {["overview", "machines", "alerts"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium capitalize transition-colors border-b-2 ${
                activeTab === tab
                  ? "border-cyan-400 text-cyan-400"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">System Overview</h2>
                <p className="text-gray-400 text-sm">Live readings update every 2 seconds</p>
              </div>
              <span className="text-xs text-gray-500">Boito Factory — Line A</span>
            </div>

            {/* STAT CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              <StatCard label="Supply Voltage"   value={readings.voltage}     unit="V"   status="normal"  icon="⚡" />
              <StatCard label="Load Current"     value={readings.current}     unit="A"   status="normal"  icon="🔌" />
              <StatCard label="Motor Temp"       value={readings.temperature} unit="°C"  status={parseFloat(readings.temperature) > 80 ? "warning" : "normal"} icon="🌡️" />
              <StatCard label="Line Pressure"    value={readings.pressure}    unit="bar" status={parseFloat(readings.pressure) < 2.8 ? "warning" : "normal"} icon="📊" />
              <StatCard label="Motor Speed"      value={readings.rpm}         unit="RPM" status="normal"  icon="⚙️" />
              <StatCard label="System Efficiency" value={readings.efficiency} unit="%"   status={parseFloat(readings.efficiency) < 80 ? "warning" : "normal"} icon="📈" />
            </div>

            {/* BOTTOM GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Machine Load */}
              <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                <h3 className="font-bold mb-4">Machine Load Distribution</h3>
                <MiniBar label="Motor 1"     value={78} max={100} color="bg-cyan-500" />
                <MiniBar label="Motor 2"     value={91} max={100} color="bg-amber-500" />
                <MiniBar label="Motor 3"     value={95} max={100} color="bg-red-500" />
                <MiniBar label="Generator A" value={65} max={100} color="bg-cyan-500" />
                <MiniBar label="Pump 1"      value={55} max={100} color="bg-emerald-500" />
              </div>

              {/* Recent Alerts */}
              <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                <h3 className="font-bold mb-4">Recent Alerts</h3>
                {alerts.slice(0, 3).map((a, i) => (
                  <AlertBadge key={i} {...a} />
                ))}
                <button
                  onClick={() => setActiveTab("alerts")}
                  className="text-cyan-400 text-sm mt-2 hover:underline"
                >
                  View all alerts →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MACHINES TAB */}
        {activeTab === "machines" && (
          <div>
            <h2 className="text-xl font-bold mb-6">Machine Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {machines.map((m, i) => {
                const statusColor =
                  m.status === "Running" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500" :
                  m.status === "Warning" ? "text-amber-400 bg-amber-500/10 border-amber-500" :
                                           "text-gray-400 bg-gray-700/50 border-gray-600";
                const dotColor =
                  m.status === "Running" ? "bg-emerald-500" :
                  m.status === "Warning" ? "bg-amber-500" : "bg-gray-500";

                return (
                  <div key={i} className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold">{m.name}</h3>
                      <span className={`w-2.5 h-2.5 rounded-full ${dotColor} ${m.status !== "Offline" ? "animate-pulse" : ""}`}></span>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${statusColor}`}>
                      {m.status}
                    </span>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Load</span>
                        <span className="font-medium">{m.load}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-700 rounded-full">
                        <div
                          className={`h-full rounded-full ${m.load > 90 ? "bg-red-500" : m.load > 75 ? "bg-amber-500" : "bg-cyan-500"}`}
                          style={{ width: `${m.load}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Temp</span>
                        <span className={`font-medium ${m.temp > 80 ? "text-red-400" : "text-white"}`}>{m.temp}°C</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ALERTS TAB */}
        {activeTab === "alerts" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Alert Log</h2>
              <div className="flex gap-2 text-xs">
                <span className="bg-red-500/10 text-red-400 border border-red-500 px-2 py-1 rounded-full">1 Critical</span>
                <span className="bg-amber-500/10 text-amber-400 border border-amber-500 px-2 py-1 rounded-full">2 Warnings</span>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500 px-2 py-1 rounded-full">2 Info</span>
              </div>
            </div>
            <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
              {alerts.map((a, i) => <AlertBadge key={i} {...a} />)}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}