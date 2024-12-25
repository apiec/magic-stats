import {CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import './WinrateGraph.css';

export type DataPoint = {
    date: number,
    value: number,
}

export type DataSeries = {
    name: string,
    data: DataPoint[],
}

type WinrateGraphProps = {
    slidingWindowSize?: number,
    data: DataSeries[],
}

export default function WinrateGraph({data, slidingWindowSize}: WinrateGraphProps) {
    return (
        <div className='winrate-graph'>
            <h3>Winrates</h3>
            <p>{slidingWindowSize ? `Sliding window - ${slidingWindowSize}` : 'All time'}</p>
            <Graph data={data}/>
        </div>
    );
}

function Graph({data}: { data: DataSeries[] }) {
    const minDate = Math.min(...data.flatMap(s => s.data).map(p => p.date));
    const maxDate = Math.max(...data.flatMap(s => s.data).map(p => p.date));
    const stepCount = 5;
    const step = Math.floor((maxDate - minDate) / stepCount);
    const lastStepFix = maxDate - minDate - step * stepCount;
    const ticks = Array.from({length: stepCount + 1}, (_, k) => minDate + k * step);
    ticks[stepCount] += lastStepFix;

    const maxValue = Math.max(...data.map(s => Math.max(...s.data.map(p => p.value))));
    const topValue = Math.ceil(10 * maxValue) / 10;
    const horizontalTicks = Array.from({length: topValue / 0.2 + 1}, (_, k) => 0.2 * k);

    return (
        <ResponsiveContainer width={600} height='80%' minHeight={400} maxHeight={600}>
            <LineChart>
                <CartesianGrid vertical={false} horizontalValues={horizontalTicks} strokeWidth={1}
                               strokeDasharray='5 5'/>
                <XAxis
                    dataKey='date'
                    type='number'
                    allowDuplicatedCategory={false} // without this active data point detection breaks ¯\_(ツ)_/¯
                    ticks={ticks}
                    domain={[minDate, maxDate]}
                    padding={{left: 20, right: 20}}
                    tickFormatter={(tickItem: number) => {
                        return new Date(tickItem).toLocaleDateString();
                    }}/>
                <YAxis ticks={horizontalTicks} dataKey='value' domain={[0, topValue]}
                       tickFormatter={(tickItem: number) => tickItem.toFixed(1)}/>
                <Tooltip formatter={(value: number, _) => (value * 100).toFixed(0) + '%'}
                         filterNull={true}
                         contentStyle={{background: '#242424'}} // todo: figure out how to style all of the shit
                         labelFormatter={(label: number, _) => new Date(label).toLocaleDateString()}/>
                <Legend/>
                {data.map((s, i) => (
                    <Line type='monotone' dataKey='value' data={s.data} name={s.name} key={s.name}
                          stroke={colors[i % colors.length]}
                          strokeDasharray={strokes[Math.floor(i / colors.length)]}
                          dot={false} strokeWidth={2}/>
                ))}
            </LineChart>
        </ResponsiveContainer>
    );
}

const colors = [
    '#f030a8',
    '#8000ff',
    '#ff8000',
    '#ff0000',
    '#00e000',
    '#1e90ff',
    '#00afaf',
    '#80f4c4',
    '#2f4f4f',
    '#808000',
    '#ffff00',
]

const strokes = [
    '',
    '10',
    '10 5 5 5',
]