import { useEffect, useState, useRef } from 'react';
// https://registry.npmjs.com/-/v1/search?text=@dynamic-data&size=100

// https://api.npmjs.org/downloads/range/last-week/{@dynamic-data/...}

function App() {

  const [data, setData] = useState([])
  const [readyData,setReadyData] = useState([])
  const [isReady, setIsReady] = useState(false)

  const calculateDownloads = (object, name) => {
    // console.log(name,object)

    const downloads = object.downloads
    let totalDownloads = 0
    let obj = {}

    downloads.forEach( item =>{
      totalDownloads = totalDownloads + item.downloads
    })
    obj["packageName"] = name
    obj["totalDownloads"] = totalDownloads

    setReadyData(oldArray  => [...oldArray, obj])
  }

  useEffect(()=>{
    fetch("https://registry.npmjs.com/-/v1/search?text=@dynamic-data&size=1000")
    .then(res => res.json())
    .then(res => setData(res.objects))
  },[])

  useEffect(()=>{
    data.forEach(item =>{
      fetch(`https://api.npmjs.org/downloads/range/last-week/${item.package.name}`)
      .then(res => res.json())
      .then(res => calculateDownloads(res, item.package.name))
    })
  },[data])

  useEffect(()=>{
    if(readyData.length===data.length){
      console.log(readyData)
      setIsReady(true)
    }
  },[readyData])

  return (
    <div className="App">
      {!isReady? 
      <div>
        Loading ...
      </div>
      : 
      <div>
        <table>
          <thead>
            <tr>
              <th>Package Name</th>
              <th>Weekly Downloads</th>
            </tr>
          </thead>
          <tbody>
          {
            readyData.map(item=>{
              return(
                <tr>
                  <td>{item.packageName}</td>
                  <td>{item.totalDownloads}</td>
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
