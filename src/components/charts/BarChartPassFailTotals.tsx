import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CustomTooltip } from "~/utils/chartUtils";
import TableToClipBoard from "../TableToClipBoard";

const colors = [
  "#b91c1c",
  "#00C49F",
  "#0088FE",
  "#FF8042",
  "#701a75",
  "#f43f5e",
  "#fbbf24",
];

const getPath = (x: number, y: number, width: number, height: number) => {
  return `M${x},${y + height}C${x + width / 3},${y + height} ${x + width / 2},${
    y + height / 3
  }
  ${x + width / 2}, ${y}
  C${x + width / 2},${y + height / 3} ${x + (2 * width) / 3},${y + height} ${
    x + width
  }, ${y + height}
  Z`;
};

type TriangleBarData = {
  fill?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
};

const TriangleBar = (props: TriangleBarData) => {
  const { fill, x, y, width, height } = props;
  if (!fill || !x || !y || !width || !height)
    return <path d="" stroke="none" fill={fill} />;
  return <path d={getPath(x, y, width, height)} stroke="none" fill={fill} />;
};

export function genChartTotalsText(data: BarLineChartDataPoint[]): string {
  const header: string[] = [];
  const row: string[] = [];
  data.forEach((dp: BarLineChartDataPoint, idx: number) => {
    console.log("Dp: ", dp);
    header.push(dp.name);
    row.push(dp.uv.toString());
  });

  return header.join("\t") + "\n" + row.join("\t");
}

const BarChartPassFailTotals: React.FC<BarChartPassFailTotalsProps> = ({
  data,
}) => {
  return (
    <div className="h-full w-full">
      <div className="m-4 ml-8">
        <TableToClipBoard
          generateText={() => genChartTotalsText(data)}
          tootlTipText="Copy Table"
          key={"AmaceTotalTable"}
        />
      </div>
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
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
              />
            ))}
          </Bar>
          <CartesianGrid stroke="#cccccc55" strokeDasharray="5 5" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "transparent" }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChartPassFailTotals;
