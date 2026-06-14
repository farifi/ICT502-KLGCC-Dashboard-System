import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const TopCoursesLineChart = ({ data = [] }) => {
  if (!data.length) return null;

  return (
    <div style={{ width: "100%", height: 320, minHeight: 320, minWidth: 0, flex: "0 0 auto" }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line dataKey="courseA" stroke="#f5a623" strokeWidth={3} dot={false} />
          <Line dataKey="courseB" stroke="#2d9cdb" strokeWidth={3} dot={false} />
          <Line dataKey="courseC" stroke="#2ecc71" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopCoursesLineChart;
