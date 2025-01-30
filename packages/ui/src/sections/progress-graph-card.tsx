import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@gr/ui/card";
import { ChartContainer } from "@gr/ui/chart";

interface StepsData {
  steps: number;
  label: string;
  date: string;
  isPrimary: boolean;
}

interface ProgressGraphCardProps {
  title: string;
  description?: string;
  data: Array<StepsData>;
}

export function ProgressGraphCard({
  title,
  description,
  data,
}: ProgressGraphCardProps) {
  return (
    <Card className="max-w-xs" x-chunk="charts-01-chunk-2">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      {data.map((item) => (
        <CardContent className="grid gap-4">
          <div className="grid auto-rows-min gap-2">
            <div className="flex items-baseline gap-1 text-2xl font-bold tabular-nums leading-none">
              {item.steps}
              <span className="text-sm font-normal text-muted-foreground">
                {item.label} {/* steps/day */}
              </span>
            </div>
            <ChartContainer
              config={{
                steps: {
                  label: "Steps",
                  color: item.isPrimary
                    ? "hsl(var(--chart-1))"
                    : "hsl(var(--muted))",
                },
              }}
              className="aspect-auto h-[32px] w-full"
            >
              <BarChart
                accessibilityLayer
                layout="vertical"
                margin={{
                  left: 0,
                  top: 0,
                  right: 0,
                  bottom: 0,
                }}
                data={[
                  {
                    steps: item.steps,
                    date: item.date,
                  },
                ]}
              >
                <Bar
                  dataKey="steps"
                  fill="var(--color-steps)"
                  radius={4}
                  barSize={32}
                >
                  <LabelList
                    position="insideLeft"
                    dataKey="date"
                    offset={8}
                    fontSize={12}
                    fill={
                      item.isPrimary ? "white" : "hsl(var(--muted-foreground))"
                    }
                  />
                </Bar>
                <YAxis dataKey="date" type="category" tickCount={1} hide />
                <XAxis dataKey="steps" type="number" hide />
              </BarChart>
            </ChartContainer>
          </div>
        </CardContent>
      ))}
    </Card>
  );
}

//       <CardContent className="grid gap-4">
//         <div className="grid auto-rows-min gap-2">
//           <div className="flex items-baseline gap-1 text-2xl font-bold tabular-nums leading-none">
//             12,453
//             <span className="text-sm font-normal text-muted-foreground">
//               steps/day
//             </span>
//           </div>
//           <ChartContainer
//             config={{
//               steps: {
//                 label: "Steps",
//                 color: "hsl(var(--chart-1))",
//               },
//             }}
//             className="aspect-auto h-[32px] w-full"
//           >
//             <BarChart
//               accessibilityLayer
//               layout="vertical"
//               margin={{
//                 left: 0,
//                 top: 0,
//                 right: 0,
//                 bottom: 0,
//               }}
//               data={progressData}
//             >
//               <Bar
//                 dataKey="steps"
//                 fill="var(--color-steps)"
//                 radius={4}
//                 barSize={32}
//               >
//                 <LabelList
//                   position="insideLeft"
//                   dataKey="date"
//                   offset={8}
//                   fontSize={12}
//                   fill="white"
//                 />
//               </Bar>
//               <YAxis dataKey="date" type="category" tickCount={1} hide />
//               <XAxis dataKey="steps" type="number" hide />
//             </BarChart>
//           </ChartContainer>
//         </div>
//         <div className="grid auto-rows-min gap-2">
//           <div className="flex items-baseline gap-1 text-2xl font-bold tabular-nums leading-none">
//             10,103
//             <span className="text-sm font-normal text-muted-foreground">
//               steps/day
//             </span>
//           </div>
//           <ChartContainer
//             config={{
//               steps: {
//                 label: "Steps",
//                 color: "hsl(var(--muted))",
//               },
//             }}
//             className="aspect-auto h-[32px] w-full"
//           >
//             <BarChart
//               accessibilityLayer
//               layout="vertical"
//               margin={{
//                 left: 0,
//                 top: 0,
//                 right: 0,
//                 bottom: 0,
//               }}
//               data={walkingDistanceData}
//             >
//               <Bar
//                 dataKey="steps"
//                 fill="var(--color-steps)"
//                 radius={4}
//                 barSize={32}
//               >
//                 <LabelList
//                   position="insideLeft"
//                   dataKey="date"
//                   offset={8}
//                   fontSize={12}
//                   fill="hsl(var(--muted-foreground))"
//                 />
//               </Bar>
//               <YAxis dataKey="date" type="category" tickCount={1} hide />
//               <XAxis dataKey="steps" type="number" hide />
//             </BarChart>
//           </ChartContainer>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
