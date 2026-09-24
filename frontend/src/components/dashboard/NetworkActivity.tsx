import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const networkData = [
  { time: '18:00', events: 24 },
  { time: '19:00', events: 31 },
  { time: '20:00', events: 28 },
  { time: '21:00', events: 43 },
  { time: '22:00', events: 37 },
  { time: '23:00', events: 52 },
]

function NetworkActivity() {
  return (
    <section className="dashboard-panel network-panel">
      <div className="panel-header">
        <div>
          <div className="panel-title">Network Activity</div>
          <div className="panel-description">
            Security events observed over the last 6 hours
          </div>
        </div>

        <div className="panel-live">
          <span />
          LIVE
        </div>
      </div>

      <div className="network-chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={networkData}>
            <CartesianGrid
              stroke="rgba(148, 163, 184, 0.07)"
              vertical={false}
            />

            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: '#475569',
                fontSize: 10,
              }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fill: '#475569',
                fontSize: 10,
              }}
              width={30}
            />

            <Tooltip
              contentStyle={{
                background: '#0f172a',
                border: '1px solid rgba(148, 163, 184, 0.12)',
                borderRadius: '8px',
                color: '#e2e8f0',
                fontSize: '11px',
              }}
            />

            <Line
              type="monotone"
              dataKey="events"
              stroke="#22d3ee"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

export default NetworkActivity