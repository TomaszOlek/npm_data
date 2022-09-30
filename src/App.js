import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function App() {

  const [data, setData] = useState([])
  const [weeklyDownloads,setweeklyDownloads] = useState([])
  const [allTimeDownloads, setAllTimeDownloads] = useState([])
  const [packagesCreateData, setPackagesCreateData] = useState([])
  const [customDownloads, setCustomDownloads] = useState([])
  const [chartData, setChartData] = useState()

  const [allTimeTotal, setAllTimeTotal] = useState(0)
  const [weeklyTotal, setWeeklyTotal] = useState(0)

  const [readyData,setReadyData] = useState([])
  const [isReady, setIsReady] = useState(false)
  const [isChartShowen, setIsChartShowen] = useState(false)

  const [customStartData,setCustomStartData] = useState()
  const [customEndData,setCustomEndData] = useState()

  const d = new Date()
  const today = d.setDate(d.getDate()) 
  const todayDate = new Date(today).toISOString().split("T")[0]

  //Get all names Startiing at "@dynamic-data"
  useEffect(()=>{
    fetch("https://registry.npmjs.com/-/v1/search?text=@dynamic-data&size=1000")
    .then(res => res.json())
    .then(res => setData(res.objects))
  },[])

  //Get weekly Total
  useEffect(()=>{
    if (weeklyDownloads.length ===  data.length){
      weeklyDownloads.forEach(item=>{
        setWeeklyTotal(prevData => prevData + item.downloads)
      })
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  },[weeklyDownloads])

  //Calculate All Time Downloads
  useEffect(()=>{
    if (allTimeDownloads.length ===  data.length){
      allTimeDownloads.forEach(item=>{
        setAllTimeTotal(prevData => prevData + item.downloads)
      })
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  },[allTimeDownloads])

  //Get all time downloads
  useEffect(()=>{
    if (packagesCreateData.length === data.length){
      console.log("packagesCreateData", packagesCreateData)

      packagesCreateData.forEach(item=>{

        const createdData = item.time.created
        const cleardData = createdData.split("T")[0]

        fetch(`https://api.npmjs.org/downloads/point/${cleardData}:${todayDate}/${item.name}`)
        .then(res => res.json())
        .then(res => setAllTimeDownloads(prevData =>[...prevData, res]))
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[packagesCreateData])

  useEffect(()=>{
    data.forEach(item =>{
      fetch(`https://api.npmjs.org/downloads/point/last-week/${item.package.name}`)
      .then(res => res.json())
      .then(res => setweeklyDownloads(prevData =>[...prevData, res]))
    })

    data.forEach(item =>{
      fetch(`https://registry.npmjs.org/${item.package.name}`)
      .then(res => res.json())
      .then(res => setPackagesCreateData(prevData =>[...prevData, res]))
    })
  },[data])

  //Set custom Data range
  useEffect(()=>{
    if(Date.parse(customStartData) < Date.parse(customEndData)){
      setCustomDownloads([])
      data.forEach(item=>{
        fetch(`https://api.npmjs.org/downloads/point/${customStartData}:${customEndData}/${item.package.name}`)
        .then(res => res.json())
        .then(res => setCustomDownloads(prevData =>[...prevData, res]))
      })
    }else{
      setCustomDownloads([])
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  },[customStartData,customEndData])

  //Process Data
  useEffect(()=>{
    if(data.length === weeklyDownloads.length && data.length === allTimeDownloads.length){
      setReadyData([])
      console.log("data", data)
      console.log("weeklyDownloads", weeklyDownloads)
      console.log("allTimeDownloads", allTimeDownloads)

      weeklyDownloads.forEach(item=>{
        let dataHolder = {}

        let allTimeIndex = allTimeDownloads.findIndex((obj => obj.package === item.package));

        dataHolder["packageName"] = item.package 
        dataHolder["weeklyDownloads"] = item.downloads
        dataHolder["allDownloads"] = allTimeDownloads[allTimeIndex].downloads
        dataHolder["allDownloadsStartRange"] = allTimeDownloads[allTimeIndex].start
        dataHolder["allDownloadsEndRange"] = allTimeDownloads[allTimeIndex].end
        dataHolder["allDownloadsRange"] = `${allTimeDownloads[allTimeIndex].start} / ${allTimeDownloads[allTimeIndex].end}`
        if(customDownloads.length === data.length){
          let customIndex = customDownloads.findIndex((obj => obj.package === item.package));
          dataHolder["customDateDownloads"] = customDownloads[customIndex].downloads
        }
        console.log()
        setReadyData(prevData => [...prevData, dataHolder])
      })
      if(data.length === readyData.length){
        setIsReady(true)
      }
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  },[weeklyDownloads,allTimeDownloads,customDownloads])

  const handleChart = (packageName,date) => {
    if(packageName && date){
      console.log(packageName,date)
      const packageCreateData = new Date(date)
      const fullDate = packageCreateData.setDate(packageCreateData.getDate() - (packageCreateData.getDay() + 6) % 7)
      let startDate = new Date(fullDate).toISOString().split("T")[0]
      
      fetch(`https://api.npmjs.org/downloads/range/${startDate}:${todayDate}/${packageName}`)
      .then(res => res.json())
      .then(res => handleChartData(res))
    }else{
      setChartData()
    }
    setIsChartShowen(prevState => !prevState)
  }

  const handleChartData = downloadsList => {
    console.log(downloadsList)
    const downloadList = downloadsList.downloads
    let chartDataHolder = []

    for (let i = 0; i < downloadList.length; i += 7) {
      let dataHolder = {}
      const chunk = downloadList.slice(i, i + 7);

      let chartDownloads = 0
      chunk.forEach(item =>{
        chartDownloads = chartDownloads + item.downloads
      })
      dataHolder["totalDownloads"] = chartDownloads
      dataHolder["dateSpan"] = `${chunk[0].day} / ${chunk[chunk.length-1].day}`
      chartDataHolder.push(dataHolder)
    }

    const chartData={
      package: downloadsList.package,
      chartData: chartDataHolder
    }

    console.log(chartData)
    setChartData(chartData)
  }

  const CustomizedTooltip = ({ active, payload, label }) => {
    console.log(active, payload, label);
  
    if (active) {
      return (
        <div className="chart-tooltip">
          <div className="chart_custom_tooltip">
            <span>DateSpan: {payload[0].payload.dateSpan}</span>
            <span>Downloads: {payload[0].payload.totalDownloads}</span>
          </div>
        </div>
      );
    }
  
    return null;
  };

  return (
    <div className="App">
      {!isReady? 
      <div>
        Loading ...
      </div>
      : 
      <div className='container'>

        <div className={`chart ${!isChartShowen?'hide':'show'}`} onClick={handleChart}>
          <div className='content'>
            {
              !chartData?
              <></>
              :
              <div style={{height:"100%", width:"100%"}}>
                <div className='header'>
                  <p className='package_name'>Selected Package: {chartData.package}</p>
                  <span className='close'/>
                </div>
                <div className='chart_data'>

                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    width={500}
                    height={300}
                    data={chartData.chartData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <YAxis />
                    <Tooltip content={<CustomizedTooltip />} />
                    <Legend />
                    <Line dataKey="totalDownloads" stroke="#8884d8" name="dateSpan" />
                  </LineChart>
                </ResponsiveContainer>

                </div>
              </div>
            }
          </div>  
        </div>

        <div className='total_count'>
          <p style={{paddingTop: "40px", fontSize: "20px"}}>Last Week Downloads: {weeklyTotal}</p>
          <p style={{paddingTop: "40px", fontSize: "20px"}}>All Time Downloads: {allTimeTotal}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Package Name</th>
              <th>Weekly Downloads</th>
              <th>All Time</th>
              <th>
                Set Date 
                <form>
                  <input 
                    type="date"
                    onChange={
                      (event) => setCustomStartData(event.target.value)
                    }/>
                     - 
                    <input 
                    type="date"
                    onChange={
                      (event) => setCustomEndData(event.target.value)
                    }/>
                </form>
              </th>
            </tr>
          </thead>
          <tbody>
          {
            readyData.map(item=>{
              return(
                <tr key={item.packageName}>
                  <td onClick={ ()=> handleChart(item.packageName, item.allDownloadsStartRange)}>{item.packageName}</td>
                  <td>{item.weeklyDownloads}</td>
                  <td>{item.allDownloads} || {item.allDownloadsRange}</td>
                  <td>{customDownloads.length === data.length? item.customDateDownloads : 0}</td>
                </tr>
              )
            })
          }
          </tbody>
        </table>
      </div>
      }
    </div>
  );
}

export default App;
