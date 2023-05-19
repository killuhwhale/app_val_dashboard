import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { CustomTooltip } from "~/utils/chartUtils";

const colors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "red", "pink"];

const getPath = (x: any, y: any, width: any, height: any) => {
  return `M${x},${y + height}C${x + width / 3},${y + height} ${x + width / 2},${
    y + height / 3
  }
  ${x + width / 2}, ${y}
  C${x + width / 2},${y + height / 3} ${x + (2 * width) / 3},${y + height} ${
    x + width
  }, ${y + height}
  Z`;
};

const TriangleBar = (props: any) => {
  const { fill, x, y, width, height } = props;

  return <path d={getPath(x, y, width, height)} stroke="none" fill={fill} />;
};

const BarChartPassFailTotals: React.FC<BarChartPassFailTotalsProps> = ({
  data,
}) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        width={600}
        height={300}
        data={data}
        margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
      >
        <Bar
          type="monotone"
          dataKey="uv"
          stroke="#8884d8"
          fill="#3b82f6"
          shape={<TriangleBar />}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % 20]} />
          ))}
        </Bar>
        <CartesianGrid stroke="#cccccc55" strokeDasharray="5 5" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BarChartPassFailTotals;
