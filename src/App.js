import { useEffect, useState } from 'react';
// https://registry.npmjs.com/-/v1/search?text=@dynamic-data&size=100

// https://api.npmjs.org/downloads/range/last-week/{@dynamic-data/...}

function App() {

  const [data, setData] = useState([])
  const [readyData,setReadyData] = useState([])

  const [weeklyDownloads,setweeklyDownloads] = useState([])
  const [allTimeDownloads, setAllTimeDownloads] = useState([])
  const [packagesCreateData, setPackagesCreateData] = useState([])

  const [allTimeTotal, setAllTimeTotal] = useState(0)
  const [weeklyTotal, setWeeklyTotal] = useState(0)

  const [isReady, setIsReady] = useState(false)

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
  },[weeklyDownloads])

  useEffect(()=>{
    if (allTimeDownloads.length ===  data.length){
      allTimeDownloads.forEach(item=>{
        setAllTimeTotal(prevData => prevData + item.downloads)
      })
    }
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
  },[packagesCreateData])

  useEffect(()=>{
    console.log("data", data)

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

  useEffect(()=>{

  // //Initailize array of objects.
  // let myArray = [
  //   {id: 0, name: "Jhon"},
  //   {id: 1, name: "Sara"},
  //   {id: 2, name: "Domnic"},
  //   {id: 3, name: "Bravo"}
  // ],
      
  // //Find index of specific object using findIndex method.    
  // objIndex = myArray.findIndex((obj => obj.id == 1));

  // //Log object to Console.
  // console.log("Before update: ", myArray[objIndex])

  // //Update object's name property.
  // myArray[objIndex].name = "Laila"

  // //Log object to console again.
  // console.log("After update: ", myArray[objIndex])

    if(data.length === weeklyDownloads.length && data.length === allTimeDownloads.length){
      console.log("data", data)
      console.log("weeklyDownloads", weeklyDownloads)
      console.log("allTimeDownloads", allTimeDownloads)

      weeklyDownloads.forEach(item=>{
        let dataHolder = {}

        let objIndex = allTimeDownloads.findIndex((obj => obj.package == item.package));

        dataHolder["packageName"] = item.package 
        dataHolder["weeklyDownloads"] = item.downloads
        dataHolder["allDownloads"] = allTimeDownloads[objIndex].downloads

        setReadyData(prevData => [...prevData, dataHolder])
      })
      if(data.length === readyData.length){
        setIsReady(true)
      }
    }
  },[weeklyDownloads,allTimeDownloads])

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
              <th>Set Date</th>
            </tr>
          </thead>
          <tbody>
          {
            readyData.map(item=>{
              return(
                <tr key={item.packageName}>
                  <td>{item.packageName}</td>
                  <td>{item.weeklyDownloads}</td>
                  <td>{item.allDownloads}</td>
                  <td>0</td>
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
