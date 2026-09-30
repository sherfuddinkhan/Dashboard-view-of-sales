export default function EasyEcomDashboard(){
  return (
    <div>
      <h1>EasyEcom Dashboard - Live Sync</h1>
      <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:15, marginTop:20}}>
        <div style={card}>124<br/>Total APIs</div>
        <div style={card}>24<br/>Inventory APIs</div>
        <div style={card}>32<br/>Order APIs</div>
        <div style={card}>18<br/>Product APIs</div>
      </div>
      <p style={{marginTop:20}}>Select any API from left sidebar - all routes work under <code>/easyecom/...</code></p>
    </div>
  )
}
const card = {background:'#fff', padding:20, borderRadius:10, textAlign:'center', fontWeight:700, boxShadow:'0 2px 8px rgba(0,0,0,0.05)'}