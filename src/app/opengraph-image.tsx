import { ImageResponse } from 'next/og'

export const alt = 'Coreor DataTable — typed React data grid'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(<div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',justifyContent:'center',padding:'90px',background:'#04090c',color:'#e8eeef',fontFamily:'Arial,sans-serif'}}>
    <div style={{display:'flex',alignItems:'center',gap:'16px',color:'#63d9dc',fontSize:24,letterSpacing:5}}>COREOR / DATA</div>
    <div style={{display:'flex',flexDirection:'column',fontSize:80,fontWeight:700,lineHeight:1.1,marginTop:35}}><span>Every data shape.</span><span style={{color:'#63d9dc'}}>One powerful grid.</span></div>
    <div style={{marginTop:48,fontSize:26,color:'#9ab0b5'}}>19 column types · typed editing · virtual rows · live Table Maker</div>
  </div>,size)
}
