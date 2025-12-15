// Componente de gráfico de torta para servicios destacados
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';




const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div style={{
        background: '#fff',
        border: '1.5px solid #d13fa0',
        borderRadius: 10,
        padding: '10px 16px',
        color: '#d13fa0',
        fontWeight: 600,
        fontSize: 15,
        boxShadow: '0 2px 8px #d13fa033',
        minWidth: 120
      }}>
        <div style={{marginBottom:2}}>{d.name}</div>
        <div style={{fontSize:14, color:'#444', fontWeight:500}}>
          {d.porcentaje ? `${d.porcentaje}%` : ''} &bull; {d.cantidad} reservas
        </div>
      </div>
    );
  }
  return null;
};


const PieServicios = ({ data }) => {
  // Si no hay datos, mostrar un sector gris "Sin datos"
  const chartData = (!data || data.length === 0)
    ? [{ name: 'Sin datos', cantidad: 1, color: '#e0e0e0', porcentaje: 100 }]
    : data;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="cantidad"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={90}
          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
        >
          {chartData.map((entry, idx) => (
            <Cell key={`cell-${idx}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PieServicios;
