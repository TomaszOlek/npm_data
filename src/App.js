import { useEffect, useState } from 'react';

function App() {

  const [data, setData] = useState([])
  const [weeklyDownloads,setweeklyDownloads] = useState([])
  const [allTimeDownloads, setAllTimeDownloads] = useState([])
  const [packagesCreateData, setPackagesCreateData] = useState([])
  const [customDownloads, setCustomDownloads] = useState([])

  const [allTimeTotal, setAllTimeTotal] = useState(0)
  const [weeklyTotal, setWeeklyTotal] = useState(0)

  const [readyData,setReadyData] = useState([])
  const [isReady, setIsReady] = useState(false)

  const [customStartData,setCustomStartData] = useState()
  const [customEndData,setCustomEndData] = useState()

  const d = new Date(); 
  const today = d.setDate(d.getDate()); 
  const todayDate = new Date(today).toISOString().split("T")[0];

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
        dataHolder["allDownloadsRange"] = `${allTimeDownloads[allTimeIndex].start} - ${allTimeDownloads[allTimeIndex].end}`
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

  return (
    <div className="App">
      {!isReady? 
      <div>
        Loading ...
      </div>
      : 
      <div className='container'>
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
                  <td>{item.packageName}</td>
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
