import React, { useState, useEffect } from "react";
import ReactMapGl, { Marker, Popup } from "react-map-gl";
import { Icon } from "semantic-ui-react";
import { connect } from "react-redux";
import Pin from "./Pin";
import axios from "axios";
function MapDisplay(props) {
  const [viewport, setViewport] = useState({
    latitude: 29.8946952,
    longitude: -81.3145395,
    zoom: 5,
    bearing: 0,
    pitch: 0,
    width: window.innerWidth,
    height: "100vh"
  });

  const [jobs, setJobs] = useState([]);
  useEffect(() => {
    let newJobs = [];
    props.jobs.forEach(job => {
      if (job.location) {
        axios
          .get(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${job.location}.json?access_token=${process.env.REACT_APP_MAP_TOKEN}`
          )
          .then(res => {
            let coords = res.data.features[0].center;
            newJobs = [...newJobs, { ...job, lat: coords[1], long: coords[0] }];
            setJobs(newJobs);
          });
      }
    });
  }, []);
  function getWindowWidth() {
    setViewport({ ...viewport, width: window.innerWidth });
  }

  useEffect(() => {
    window.addEventListener("resize", getWindowWidth);
  }, []);

  const [clickedExp, setClickedExp] = useState(null);

  return (
    <>
      {
        <div style={fixWidth}>
          <ReactMapGl
            {...viewport}
            mapboxApiAccessToken={process.env.REACT_APP_MAP_TOKEN}
            mapStyle={process.env.REACT_APP_MAP_STYLE}
            onViewportChange={viewport => {
              setViewport(viewport);
            }}
          >
            {jobs &&
              jobs.map(
                (place, index) =>
                  place.lat && (
                    <Marker
                      key={index}
                      latitude={place.lat}
                      longitude={place.long}
                    >
                      <button
                        style={transparent}
                        onClick={e => {
                          e.preventDefault();
                          setClickedExp(place);
                        }}
                      >
                        <Pin />
                      </button>
                    </Marker>
                  )
              )}
            {clickedExp && (
              <Popup
                latitude={clickedExp.lat}
                longitude={clickedExp.long}
                onClose={() => {
                  setClickedExp(null);
                }}
              >
                <div style={pop}>
                  <img style={imgStyle} src={clickedExp.logo} alt="" />
                  <h3>{clickedExp.jobTitle}</h3>
                  <p>{clickedExp.companyTitle}</p>
                </div>
              </Popup>
            )}
          </ReactMapGl>
        </div>
      }
    </>
  );
}
function mapStateToProps(state) {
  return {
    jobs: state.jobs
  };
}
const mapDispatchToProps = {};
export default connect(mapStateToProps, mapDispatchToProps)(MapDisplay);
const color = { color: "white" };

const fixWidth = {
  overflow: "hidden",
  margin: "0 auto"
};
const transparent = {
  background: "rgba(0,0,0,0)",
  border: "none"
};
const imgStyle = {
  width: "35px",
  height: "auto"
};
const pop = {
  width: "200px"
};
