// Gráfico de línea/área para evolución mensual de ganancias
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

const getUltimos12Meses = () => {
  const mesesLabels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const hoy = new Date();
  const meses = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth();
    meses.push({ mes: `${mesesLabels[m]} ${y}`, ganancia: 0 });
  }
  return meses;
};

const LineaGanancias = ({ data }) => {
  const chartData = (!data || data.length === 0) ? getUltimos12Meses() : data;
  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={chartData} margin={{ top: 16, right: 24, left: 0, bottom: 16 }}>
        <defs>
          <linearGradient id="colorGanancia" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#d13fa0" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#d13fa0" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <XAxis dataKey="mes" tick={{fontSize:13}}/>
        <YAxis allowDecimals={false} tickFormatter={v => `$${v.toLocaleString()}`}/>
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip formatter={v => `$${v.toLocaleString()}`} labelFormatter={l => l} />
        <Legend />
        <Area type="monotone" dataKey="ganancia" name="Ganancia" stroke="#d13fa0" fillOpacity={1} fill="url(#colorGanancia)" />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default LineaGanancias;
